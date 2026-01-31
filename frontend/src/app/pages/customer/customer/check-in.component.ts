import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PassengerService } from '../../../services/passenger.service';
import { BookingService } from '../../../services/booking.service';
import { FlightService } from '../../../services/flight.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Flight } from '../../../models/flight.model';
import { Booking, CheckInResponse } from '../../../models/booking.model';
import { Passenger } from '../../../models/passenger.model';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError, shareReplay, tap, filter, distinctUntilChanged, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-check-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './check-in.component.html',
  styleUrl: './customer.component.scss'
})
export class CheckInComponent implements OnInit {
  checkInForm!: FormGroup;
  localLoading = false;

  private passengerProfile$!: Observable<Passenger | null>;

  vm$: Observable<{
    confirmedBookings: Booking[];
    passengerId: number | null;
    loading: boolean;
    error: string;
    checkInResult: CheckInResponse | null;
  }>;

  private checkInResult$ = new BehaviorSubject<CheckInResponse | null>(null);
  private error$ = new BehaviorSubject<string>('');

  constructor(
    private fb: FormBuilder,
    private passengerService: PassengerService,
    private bookingService: BookingService,
    private auth: AuthService
  ) {
    this.initializeForm();

    this.passengerProfile$ = this.auth.currentUser$.pipe(
      filter(u => !!u),
      map(u => u!.username),
      distinctUntilChanged(),
      switchMap(username => this.passengerService.getPassengerByUsername(username).pipe(
        catchError(err => {
          console.error('Checkin profile error:', err);
          return of(null);
        })
      )),
      shareReplay(1)
    );

    const bookings$ = this.passengerProfile$.pipe(
      switchMap(p => p ? this.bookingService.getBookings(p.id) : of([])),
      map(bookings => bookings.filter(b => b.status === 'CONFIRMED')),
      startWith([])
    );

    this.vm$ = combineLatest([bookings$, this.passengerProfile$, this.checkInResult$, this.error$]).pipe(
      map(([confirmedBookings, passenger, checkInResult, error]) => ({
        confirmedBookings,
        passengerId: passenger ? passenger.id : null,
        loading: false,
        error,
        checkInResult
      })),
      startWith({
        confirmedBookings: [],
        passengerId: null,
        loading: true,
        error: '',
        checkInResult: null
      })
    );
  }

  ngOnInit() {
    this.passengerProfile$.pipe(filter(p => !!p)).subscribe(p => {
      this.checkInForm.patchValue({ passengerId: p!.id });
    });
  }

  initializeForm() {
    this.checkInForm = this.fb.group({
      passengerId: ['', Validators.required],
      bookingId: ['', Validators.required]
    });
  }

  onCheckIn() {
    if (this.checkInForm.invalid) {
      alert('Please fill out all check-in fields.');
      return;
    }

    this.localLoading = true;
    this.error$.next('');
    const { bookingId } = this.checkInForm.value;

    this.passengerService.checkInPassenger(bookingId, '').subscribe({
      next: (result) => {
        this.checkInResult$.next(result);
        this.localLoading = false;
        alert('Check-In Successful! Enrollment complete.');
      },
      error: (err) => {
        console.error('Check-in error:', err);
        const msg = err?.error?.message || 'Check-in failed. Please verify your data.';
        this.error$.next(msg);
        alert(msg);
        this.localLoading = false;
      }
    });
  }

  reset() {
    const currentPid = this.checkInForm.get('passengerId')?.value;
    this.checkInForm.reset({ passengerId: currentPid });
    this.checkInResult$.next(null);
    this.error$.next('');
  }
}
