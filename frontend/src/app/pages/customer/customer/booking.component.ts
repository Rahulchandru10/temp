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

  // UI State behavior subject for reactive updates
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

    // 0. Shared passenger profile stream
    this.passengerProfile$ = this.auth.currentUser$.pipe(
      filter(u => !!u),
      map(u => u!.username),
      distinctUntilChanged(),
      switchMap(email => this.passengerService.getPassengerByEmail(email).pipe(
        tap(p => {
          if (p && !this.bookingForm.get('passengerId')?.value) {
            this.bookingForm.patchValue({ passengerId: p.id });
          }
        }),
        catchError(err => {
          console.error('Profile Load Crash:', err);
          return of(null);
        })
      )),
      shareReplay(1)
    );

    // 1. Load Bookings stream
    const bookings$ = combineLatest([this.passengerProfile$, this.refreshBookings$]).pipe(
      filter(([p]) => !!p),
      switchMap(([passenger]) => {
        return this.bookingService.getBookings(passenger!.id).pipe(
          catchError(err => {
            console.error('History API error:', err);
            return of([]);
          })
        );
      }),
      startWith([])
    );

    // 2. Load Flights
    const flights$ = this.flightService.getAllFlights().pipe(
      catchError(() => of([])),
      startWith([])
    );

    // 3. Combined View Model (Includes ALL UI state for guaranteed synchronization)
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
      passengerId: ['', Validators.required],
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

  // Helper to update UI state reactively
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
    const booking: BookingRequest = this.bookingForm.value;

    this.bookingService.bookFlight(booking).subscribe({
      next: (result: Booking) => {
        this.paymentForm.patchValue({ amount: result.totalAmount });
        // Update all UI state immediately - guaranteed to refresh view via vm$
        this.updateState({
          step: 'payment',
          localLoading: false,
          bookingResult: result
        });
        console.log('Ticket linking successful, UI switched to payment step.');
      },
      error: (err) => {
        console.error('Ticket failed:', err);
        this.error$.next(err?.error?.message || 'Server rejected the traveler details.');
        this.updateState({ localLoading: false });
      }
    });
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
