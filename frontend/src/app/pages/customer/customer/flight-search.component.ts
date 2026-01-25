import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlightService } from '../../../services/flight.service';
import { BookingService } from '../../../services/booking.service';
import { Flight, FlightSearchParams } from '../../../models/flight.model';
import { Observable, BehaviorSubject, of, combineLatest } from 'rxjs';
import { switchMap, map, startWith, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './flight-search.component.html',
  styleUrl: './customer.component.scss'
})
export class FlightSearchComponent implements OnInit {
  searchForm!: FormGroup;

  private searchParams$ = new BehaviorSubject<FlightSearchParams | null>(null);

  vm$: Observable<{
    flights: Flight[];
    loading: boolean;
    error: string;
    searched: boolean;
  }>;

  constructor(
    private fb: FormBuilder,
    private flightService: FlightService,
    private bookingService: BookingService
  ) {
    this.initializeForm();

    this.vm$ = this.searchParams$.pipe(
      switchMap(params => {
        if (!params) {
          return of({ flights: [], loading: false, error: '', searched: false });
        }

        return this.flightService.searchFlights(params).pipe(
          map(flights => ({
            flights,
            loading: false,
            error: flights.length === 0 ? 'No flights found for your search criteria.' : '',
            searched: true
          })),
          startWith({ flights: [], loading: true, error: '', searched: true }),
          catchError(err => {
            console.error('Search error:', err);
            return of({ flights: [], loading: false, error: 'Failed to search flights. Please try again.', searched: true });
          })
        );
      })
    );
  }

  ngOnInit() { }

  initializeForm() {
    const today = new Date().toISOString().split('T')[0];
    this.searchForm = this.fb.group({
      source: ['', Validators.required],
      destination: ['', Validators.required],
      date: [today, Validators.required]
    });
  }

  onSearch() {
    if (this.searchForm.invalid) return;

    const params: FlightSearchParams = {
      source: this.searchForm.get('source')?.value,
      destination: this.searchForm.get('destination')?.value,
      date: this.searchForm.get('date')?.value
    };

    this.searchParams$.next(params);
  }

  bookFlight(flight: Flight) {
    this.bookingService.selectFlight(flight);
  }

  reset() {
    this.searchForm.reset({
      source: '',
      destination: '',
      date: new Date().toISOString().split('T')[0]
    });
    this.searchParams$.next(null);
  }
}
