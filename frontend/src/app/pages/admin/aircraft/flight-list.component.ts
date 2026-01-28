import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { switchMap, shareReplay, map, tap, catchError } from 'rxjs/operators';
import { FlightService } from '../../../services/flight.service';
import { AircraftService } from '../../../services/aircraft.service';
import { Flight, FlightRequest } from '../../../models/flight.model';
import { Aircraft } from '../../../models/aircraft.model';

@Component({
  selector: 'app-flight-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './flight-list.component.html',
  styleUrl: './aircraft.component.scss'
})
export class FlightListComponent implements OnInit {
  flights$!: Observable<Flight[]>;
  aircraft$!: Observable<Aircraft[]>;
  private flightsRefreshSubject = new BehaviorSubject<void>(undefined);
  private aircraftRefreshSubject = new BehaviorSubject<void>(undefined);
  flightForm!: FormGroup;
  showForm = false;
  editingId: number | null = null;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private flightService: FlightService,
    private aircraftService: AircraftService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    console.log('FlightListComponent initialized');

    // Set up aircraft observable
    this.aircraft$ = this.aircraftRefreshSubject.asObservable().pipe(
      switchMap(() => {
        console.log('Loading available aircraft for flight form...');
        return this.flightService.getAvailableAircraft(this.editingId || undefined).pipe(
          tap(data => console.log('Available aircraft received:', data)),
          catchError(err => {
            console.error('Error loading available aircraft:', err);
            return of([]);
          })
        );
      })
    );

    // Set up flights observable
    this.flights$ = this.flightsRefreshSubject.asObservable().pipe(
      switchMap(() => {
        this.loading = true;
        this.error = '';
        console.log('Loading flights...');
        return this.flightService.getAllFlights().pipe(
          tap(() => this.loading = false),
          catchError(err => {
            console.error('Failed to load flights:', err);
            this.error = 'Failed to load flights';
            this.loading = false;
            return of([]);
          })
        );
      }),
      shareReplay(1)
    );
  }

  initializeForm() {
    this.flightForm = this.fb.group({
      flightNumber: ['', [Validators.required, Validators.minLength(3)]],
      source: ['', Validators.required],
      destination: ['', Validators.required],
      departureTime: ['', Validators.required],
      arrivalTime: ['', Validators.required],
      aircraftId: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]]
    });
  }

  loadFlights() {
    console.log('Triggering flights load...');
    this.flightsRefreshSubject.next();
  }

  loadAircraft() {
    console.log('Triggering aircraft load for flight form...');
    this.aircraftRefreshSubject.next();
  }

  openForm() {
    this.showForm = true;
    this.editingId = null;
    this.flightForm.reset();
    this.loadAircraft();
  }

  closeForm() {
    this.showForm = false;
    this.flightForm.reset();
  }

  onSubmit() {
    if (this.flightForm.invalid) return;

    const formValue: FlightRequest = this.flightForm.value;

    if (this.editingId) {
      this.flightService.updateFlight(this.editingId, formValue).subscribe({
        next: () => {
          this.loadFlights();
          this.closeForm();
        },
        error: (err) => {
          this.error = err.error?.message || err.error || 'Failed to update flight';
        }
      });
    } else {
      this.flightService.createFlight(formValue).subscribe({
        next: () => {
          this.loadFlights();
          this.closeForm();
        },
        error: (err) => {
          this.error = err.error?.message || err.error || 'Failed to create flight';
        }
      });
    }
  }

  edit(flight: any) {
    this.editingId = flight.id;
    this.flightForm.patchValue({
      ...flight,
      aircraftId: flight.aircraft?.id
    });
    this.showForm = true;
    this.loadAircraft();
  }

  delete(id: number) {
    if (confirm('Are you sure?')) {
      this.flightService.deleteFlight(id).subscribe({
        next: () => {
          this.loadFlights();
        },
        error: () => {
          this.error = 'Failed to delete flight';
        }
      });
    }
  }
}
