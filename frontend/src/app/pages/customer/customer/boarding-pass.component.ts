import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoardingPassService } from '../../../services/boarding-pass.service';
import { AuthService } from '../../../core/auth/auth.service';
import { PassengerService } from '../../../services/passenger.service';
import { BookingService } from '../../../services/booking.service';
import { BoardingPass, Passenger } from '../../../models/passenger.model';
import { Booking } from '../../../models/booking.model';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { switchMap, map, startWith, catchError, filter, shareReplay, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-boarding-pass',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './boarding-pass.component.html',
  styleUrl: './customer.component.scss'
})
export class BoardingPassComponent implements OnInit {
  boardingPassForm!: FormGroup;
  localLoading = false;

  private passengerProfile$!: Observable<Passenger | null>;

  vm$: Observable<{
    passengerId: number | null;
    confirmedBookings: Booking[];
    loading: boolean;
    error: string;
    boardingPass: BoardingPass | null;
  }>;

  private boardingPass$ = new BehaviorSubject<BoardingPass | null>(null);
  private error$ = new BehaviorSubject<string>('');

  constructor(
    private fb: FormBuilder,
    private boardingPassService: BoardingPassService,
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
          console.error('Boarding profile error:', err);
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

    this.vm$ = combineLatest([this.passengerProfile$, this.boardingPass$, this.error$, bookings$]).pipe(
      map(([passenger, boardingPass, error, confirmedBookings]) => ({
        passengerId: passenger ? passenger.id : null,
        confirmedBookings,
        loading: false,
        error,
        boardingPass
      })),
      startWith({
        passengerId: null,
        confirmedBookings: [],
        loading: true,
        error: '',
        boardingPass: null
      })
    );
  }

  ngOnInit() {
    this.passengerProfile$.pipe(filter(p => !!p)).subscribe(p => {
      this.boardingPassForm.patchValue({ passengerId: p!.id });
    });
  }

  initializeForm() {
    this.boardingPassForm = this.fb.group({
      passengerId: ['', Validators.required],
      flightNumber: ['', Validators.required] // Based on flight details as requested
    });
  }

  getBoardingPass(booking?: Booking) {
    if (!booking) return;

    this.boardingPassForm.patchValue({ flightNumber: booking.flight.flightNumber });

    this.localLoading = true;
    this.error$.next('');

    this.boardingPassService.getBoardingPass(booking.id).subscribe({
      next: (result) => {
        this.boardingPass$.next(result);
        this.localLoading = false;
        if (!result) {
          this.error$.next('Please do check-in to get boarding pass');
        }
      },
      error: (err) => {
        console.error('Boarding pass error:', err);
        const msg = 'Please do check-in to get boarding pass';
        this.error$.next(msg);
        this.localLoading = false;
      }
    });
  }

  downloadPass() {
    alert('Saving your digital boarding pass to Downloads...');
  }

  resetBoardingPass() {
    this.boardingPass$.next(null);
    this.error$.next('');
  }
}
