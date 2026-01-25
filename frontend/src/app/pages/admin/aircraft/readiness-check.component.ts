import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ReadinessService } from '../../../services/readiness.service';
import { FlightService } from '../../../services/flight.service';
import { Flight } from '../../../models/flight.model';
import { ReadinessCheck } from '../../../models/aircraft.model';
import { CrewService } from '../../../services/crew.service';
import { Crew } from '../../../models/crew.model';
import { AircraftService } from '../../../services/aircraft.service';
import { Aircraft } from '../../../models/aircraft.model';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, switchMap, startWith, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-readiness-check',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './readiness-check.component.html',
  styleUrl: './aircraft.component.scss'
})
export class ReadinessCheckComponent implements OnInit {
  private flightsRefresh$ = new BehaviorSubject<void>(undefined);
  private checkTrigger$ = new BehaviorSubject<number | null>(null);
  private assignTrigger$ = new BehaviorSubject<void>(undefined);
  private error$ = new BehaviorSubject<string>('');

  vm$: Observable<{
    flights: Flight[];
    availableCrew: Crew[];
    allAircraft: Aircraft[];
    readinessResult: ReadinessCheck | null;
    loading: boolean;
    error: string;
  }>;

  readinessForm!: FormGroup;
  selectedCrewIds: number[] = [];
  selectedAircraftId: number | null = null;
  assigning = false;

  constructor(
    private fb: FormBuilder,
    private readinessService: ReadinessService,
    private flightService: FlightService,
    private crewService: CrewService,
    private aircraftService: AircraftService
  ) {
    this.initializeForm();

    const flights$ = this.flightsRefresh$.pipe(
      switchMap(() => this.flightService.getAllFlights().pipe(
        startWith([]),
        catchError(() => of([]))
      ))
    );

    const data$ = this.assignTrigger$.pipe(
      startWith(undefined),
      switchMap(() => combineLatest([
        this.crewService.getAllCrew().pipe(map(crew => crew.filter(c => c.available)), catchError(() => of([]))),
        this.aircraftService.getAllAircraft().pipe(catchError(() => of([])))
      ]))
    );

    const readinessResult$ = this.checkTrigger$.pipe(
      switchMap(flightId => {
        if (!flightId) return of(null);
        return this.readinessService.checkFlightReadiness(flightId).pipe(
          catchError(() => of(null))
        );
      })
    );

    this.vm$ = combineLatest([flights$, data$, readinessResult$, this.error$]).pipe(
      map(([flights, [availableCrew, allAircraft], readinessResult, error]) => ({
        flights,
        availableCrew,
        allAircraft,
        readinessResult,
        loading: false,
        error
      })),
      startWith({
        flights: [],
        availableCrew: [],
        allAircraft: [],
        readinessResult: null,
        loading: true,
        error: ''
      })
    );
  }

  ngOnInit() { }

  initializeForm() {
    this.readinessForm = this.fb.group({
      flightId: ['', Validators.required]
    });
  }

  checkReadiness() {
    if (this.readinessForm.invalid) return;
    this.error$.next('');
    const flightId = Number(this.readinessForm.get('flightId')?.value);
    this.checkTrigger$.next(flightId);
  }

  assignAircraft() {
    const flightId = Number(this.readinessForm.get('flightId')?.value);
    if (!this.selectedAircraftId || !flightId) return;

    this.assigning = true;
    this.error$.next('');
    this.flightService.assignAircraft(flightId, this.selectedAircraftId).subscribe({
      next: () => {
        this.assigning = false;
        this.selectedAircraftId = null;
        this.assignTrigger$.next();
        this.flightsRefresh$.next();
        this.checkReadiness();
      },
      error: (err) => {
        console.error('Aircraft assignment failed:', err);
        this.error$.next('Failed to assign aircraft: ' + (err?.error?.message || err?.message || 'Unknown error'));
        this.assigning = false;
      }
    });
  }

  toggleCrewSelection(crewId: number) {
    const index = this.selectedCrewIds.indexOf(crewId);
    if (index > -1) {
      this.selectedCrewIds.splice(index, 1);
    } else {
      this.selectedCrewIds.push(crewId);
    }
  }

  assignSelectedCrew() {
    const flightId = Number(this.readinessForm.get('flightId')?.value);
    if (this.selectedCrewIds.length === 0 || !flightId) return;

    this.assigning = true;
    let completed = 0;
    this.selectedCrewIds.forEach(crewId => {
      this.crewService.assignCrewToFlight(crewId, flightId).subscribe({
        next: () => {
          completed++;
          if (completed === this.selectedCrewIds.length) {
            this.assigning = false;
            this.selectedCrewIds = [];
            this.assignTrigger$.next();
            this.checkReadiness();
          }
        },
        error: () => {
          completed++;
          if (completed === this.selectedCrewIds.length) {
            this.assigning = false;
            this.assignTrigger$.next();
            this.checkReadiness();
          }
        }
      });
    });
  }
}
