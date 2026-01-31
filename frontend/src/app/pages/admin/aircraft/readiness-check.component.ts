import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ReadinessService } from '../../../services/readiness.service';
import { FlightService } from '../../../services/flight.service';
import { CrewService } from '../../../services/crew.service';
import { AircraftService } from '../../../services/aircraft.service';
import { Flight } from '../../../models/flight.model';
import { Crew } from '../../../models/crew.model';
import { Aircraft } from '../../../models/aircraft.model';
import { ReadinessCheck } from '../../../models/aircraft.model';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, switchMap, startWith, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-readiness-check',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './readiness-check.component.html',
  styleUrls: ['./aircraft.component.scss']
})
export class ReadinessCheckComponent implements OnInit {
  readinessForm!: FormGroup;
  selectedCrewIds: number[] = [];
  assigning = false;

  // Local copy of crew for duplicate role checking
  availableCrew: Crew[] = [];

  private flightsRefresh$ = new BehaviorSubject<void>(undefined);
  private checkTrigger$ = new BehaviorSubject<number | null>(null);
  private assignTrigger$ = new BehaviorSubject<void>(undefined);
  private error$ = new BehaviorSubject<string>('');
  private checking$ = new BehaviorSubject<boolean>(false);

  vm$: Observable<{
    flights: Flight[];
    availableCrew: Crew[];
    allAircraft: Aircraft[];
    readinessResult: ReadinessCheck | null;
    loading: boolean;
    checking: boolean;
    error: string;
  }>;

  constructor(
    private fb: FormBuilder,
    private readinessService: ReadinessService,
    private flightService: FlightService,
    private crewService: CrewService,
    private aircraftService: AircraftService
  ) {
    this.initializeForm();

    // Flights observable
    const flights$ = this.flightsRefresh$.pipe(
      switchMap(() => this.flightService.getAllFlights().pipe(
        map(flights => flights.filter(f => f.status !== 'READY')),
        catchError(() => of([]))
      )),
      startWith([] as Flight[])
    );

    // Crew + aircraft data observable
    const data$ = this.assignTrigger$.pipe(
      startWith(undefined),
      switchMap(() => combineLatest([
        this.crewService.getAllCrew().pipe(
          map(crew => crew.filter(c => c.available)),
          catchError(() => of([] as Crew[]))
        ),
        this.aircraftService.getAllAircraft().pipe(
          catchError(() => of([] as Aircraft[]))
        )
      ]))
    );

    // Readiness result observable
    const readinessResult$ = this.checkTrigger$.pipe(
      tap(id => { if (id) this.checking$.next(true); }),
      switchMap(flightId => {
        if (!flightId) return of(null);
        return this.readinessService.checkFlightReadiness(flightId).pipe(
          tap(() => this.checking$.next(false)),
          catchError(err => {
            this.checking$.next(false);
            this.error$.next('Failed to verify flight readiness. System might be offline.');
            return of(null);
          })
        );
      }),
      startWith(null as ReadinessCheck | null)
    );

    // Combine everything into vm$
    this.vm$ = combineLatest([
      flights$,
      data$,
      readinessResult$,
      this.error$.pipe(startWith('')),
      this.checking$
    ]).pipe(
      map(([flights, [availableCrew, allAircraft], readinessResult, error, checking]) => ({
        flights,
        availableCrew,
        allAircraft,
        readinessResult,
        loading: false,
        checking,
        error
      })),
      startWith({
        flights: [],
        availableCrew: [],
        allAircraft: [],
        readinessResult: null,
        loading: true,
        checking: false,
        error: ''
      })
    );
  }

  ngOnInit() {
    // Keep local copy of availableCrew
    this.vm$.subscribe(vm => {
      this.availableCrew = vm.availableCrew;
    });

    // Trigger readiness check when flight changes
    this.readinessForm.get('flightId')?.valueChanges.subscribe(value => {
      if (value) {
        this.checkReadiness();
      } else {
        this.checkTrigger$.next(null);
      }
    });
  }

  initializeForm() {
    this.readinessForm = this.fb.group({
      flightId: ['']
    });
  }

  checkReadiness() {
    this.error$.next('');
    const flightId = Number(this.readinessForm.get('flightId')?.value);
    if (!flightId) return;
    this.checkTrigger$.next(flightId);
  }

  toggleCrewSelection(crewId: number) {
    const index = this.selectedCrewIds.indexOf(crewId);
    if (index > -1) {
      this.selectedCrewIds.splice(index, 1); // uncheck
    } else {
      this.selectedCrewIds.push(crewId);     // check
    }
  }

  assignSelectedCrew() {
    const flightId = Number(this.readinessForm.get('flightId')?.value);
    if (!flightId || this.selectedCrewIds.length === 0) return;

    // ✅ Duplicate role check
    const selectedRoles = this.selectedCrewIds.map(id => 
      this.availableCrew.find(c => c.id === id)?.role
    );
    const uniqueRoles = new Set(selectedRoles);
    if (uniqueRoles.size !== selectedRoles.length) {
      this.error$.next("Cannot assign two crew members with the same role.");
      return; // stop assignment
    }

    // Assign selected crew
    this.assigning = true;
    this.error$.next('');
    const assignments = this.selectedCrewIds.map(crewId =>
      this.crewService.assignCrewToFlight(crewId, flightId)
    );

    combineLatest(assignments).subscribe({
      next: () => {
        this.assigning = false;
        this.selectedCrewIds = [];
        this.assignTrigger$.next(); // refresh crew & aircraft
        this.checkReadiness();      // update readiness
      },
      error: (err) => {
        this.error$.next(err.error?.message || 'Error assigning crew.');
        this.assigning = false;
      }
    });
  }
}
