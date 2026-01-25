import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../../services/booking.service';
import { PassengerService } from '../../../services/passenger.service';
import { FlightService } from '../../../services/flight.service';
import { Booking, BookingRequest, PaymentRequest } from '../../../models/booking.model';
import { Flight } from '../../../models/flight.model';
import { Passenger } from '../../../models/passenger.model';
import { AuthService } from '../../../core/auth/auth.service';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError, tap, filter, shareReplay, startWith, distinctUntilChanged } from 'rxjs/operators';

interface BookingState {
  step: 'list' | 'booking' | 'payment';
  localLoading: boolean;
  bookingResult: Booking | null;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking.component.html',
  styleUrl: './customer.component.scss'
})
export class BookingComponent implements OnInit {
  private refreshBookings$ = new BehaviorSubject<void>(undefined);
  private error$ = new BehaviorSubject<string>('');

  private state$ = new BehaviorSubject<BookingState>({
    step: 'list',
    localLoading: false,
    bookingResult: null
  });

  private passengerProfile$!: Observable<Passenger | null>;

  vm$: Observable<{
    myBookings: Booking[];
    flights: Flight[];
    passengerId: number | null;
    loading: boolean;
    error: string;
    step: 'list' | 'booking' | 'payment';
    localLoading: boolean;
    bookingResult: Booking | null;
  }>;

  bookingForm!: FormGroup;
  paymentForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private passengerService: PassengerService,
    private bookingService: BookingService,
    private flightService: FlightService,
    private auth: AuthService
  ) {
    this.initializeForms();

    this.passengerProfile$ = this.auth.currentUser$.pipe(
      filter(u => !!u),
      tap(u => {
        if (u) {
          this.bookingForm.patchValue({
            name: u.fullName,
            email: u.email
          });
        }
      }),
      map(u => u!.username),
      distinctUntilChanged(),
      switchMap(username => this.passengerService.getPassengerByUsername(username).pipe(
        tap(p => {
          if (p) {
            this.bookingForm.patchValue({
              passengerId: p.id,
              name: p.name,
              email: p.email
            });
          }
        }),
        catchError(() => of(null))
      )),
      shareReplay(1)
    );

    const bookings$ = combineLatest([this.passengerProfile$, this.refreshBookings$]).pipe(
      switchMap(([passenger]) => {
        if (!passenger) return of([]);
        return this.bookingService.getBookings(passenger.id).pipe(
          catchError(() => of([]))
        );
      }),
      startWith([])
    );

    const flights$ = this.flightService.getAllFlights().pipe(
      catchError(() => of([])),
      startWith([])
    );

    this.vm$ = combineLatest([
      bookings$,
      flights$,
      this.passengerProfile$,
      this.error$.pipe(startWith('')),
      this.state$
    ]).pipe(
      map(([myBookings, flights, passenger, error, state]) => ({
        myBookings,
        flights,
        passengerId: passenger ? passenger.id : null,
        loading: false,
        error,
        ...state
      })),
      startWith({
        myBookings: [],
        flights: [],
        passengerId: null,
        loading: true,
        error: '',
        step: 'list' as const,
        localLoading: false,
        bookingResult: null
      } as any)
    );
  }

  ngOnInit() {
    this.bookingService.selectedFlight$.subscribe(flight => {
      if (flight) {
        this.bookingForm.patchValue({ flightId: flight.id });
        this.updateState({ step: 'booking' });
      }
    });
  }

  initializeForms() {
    this.bookingForm = this.fb.group({
      passengerId: [''],
      flightId: ['', Validators.required],
      seats: [1, [Validators.required, Validators.min(1)]],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.paymentForm = this.fb.group({
      paymentMode: ['CREDIT_CARD', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]]
    });
  }

  public updateState(partial: Partial<BookingState>) {
    this.state$.next({ ...this.state$.value, ...partial });
  }

  startNewBooking() {
    this.error$.next('');
    this.updateState({ step: 'booking' });
  }

  bookFlight() {
    if (this.bookingForm.invalid) {
      this.error$.next('Please fill in all traveler details correctly.');
      return;
    }

    this.updateState({ localLoading: true });
    this.error$.next('');

    // Merge form values with current username
    this.auth.currentUser$.subscribe(user => {
      if (!user) return;

      const booking: BookingRequest = {
        ...this.bookingForm.value,
        username: user.username
      };

      this.bookingService.bookFlight(booking).subscribe({
        next: (result: Booking) => {
          this.paymentForm.patchValue({ amount: result.totalAmount });
          this.updateState({
            step: 'payment',
            localLoading: false,
            bookingResult: result
          });
        },
        error: (err) => {
          this.error$.next(err?.error?.message || 'Server rejected the traveler details.');
          this.updateState({ localLoading: false });
        }
      });
    }).unsubscribe();
  }

  makePayment() {
    const { bookingResult } = this.state$.value;
    if (this.paymentForm.invalid || !bookingResult) return;

    this.updateState({ localLoading: true });
    this.error$.next('');
    const paymentRequest: PaymentRequest = {
      bookingId: bookingResult.id,
      ...this.paymentForm.value
    };

    this.bookingService.makePayment(paymentRequest).subscribe({
      next: () => {
        alert('Payment confirmed! Your ticket is now in your travel history.');
        this.refreshBookings$.next();
        this.updateState({
          step: 'list',
          localLoading: false,
          bookingResult: null
        });

        // Clear user-specific inputs
        const pid = this.bookingForm.get('passengerId')?.value;
        this.bookingForm.patchValue({
          passengerId: pid,
          seats: 1,
          flightId: '',
          name: '',
          email: ''
        });
      },
      error: (err) => {
        console.error('Payment failure:', err);
        this.error$.next('Secure payment failed.');
        this.updateState({ localLoading: false });
      }
    });
  }

  cancelBookingStep() {
    this.updateState({ step: 'list', bookingResult: null });
    this.error$.next('');
  }
}
