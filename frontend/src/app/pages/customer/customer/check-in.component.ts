import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PassengerService } from '../../../services/passenger.service';
import { FlightService } from '../../../services/flight.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Flight } from '../../../models/flight.model';
import { CheckInResponse, Passenger } from '../../../models/passenger.model';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { switchMap, map, startWith, catchError, filter, shareReplay } from 'rxjs/operators';

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
    flights: Flight[];
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
    private flightService: FlightService,
    private auth: AuthService
  ) {
    this.initializeForm();

    this.passengerProfile$ = this.auth.currentUser$.pipe(
      switchMap(user => {
        if (!user) return of(null);
        return this.passengerService.getPassengerByEmail(user.username).pipe(
          catchError(() => of(null))
        );
      }),
      shareReplay(1)
    );

    const flights$ = this.flightService.getAllFlights().pipe(
      catchError(() => of([])),
      startWith([])
    );

    this.vm$ = combineLatest([flights$, this.passengerProfile$, this.checkInResult$, this.error$]).pipe(
      map(([flights, passenger, checkInResult, error]) => ({
        flights,
        passengerId: passenger ? passenger.id : null,
        loading: false,
        error,
        checkInResult
      })),
      startWith({
        flights: [],
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
      flightId: ['', Validators.required],
      seatNumber: ['', Validators.required]
    });
  }

  onCheckIn() {
    if (this.checkInForm.invalid) {
      alert('Please fill out all check-in fields.');
      return;
    }

    this.localLoading = true;
    this.error$.next('');
    const { passengerId, seatNumber } = this.checkInForm.value;

    this.passengerService.checkInPassenger(passengerId, seatNumber).subscribe({
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
