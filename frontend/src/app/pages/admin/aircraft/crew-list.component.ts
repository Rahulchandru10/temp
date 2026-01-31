import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CrewService } from '../../../services/crew.service';
import { Crew, CrewRequest } from '../../../models/crew.model';
import { FlightService } from '../../../services/flight.service';
import { Flight } from '../../../models/flight.model';
import { Observable, BehaviorSubject, of, combineLatest } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-crew-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './crew-list.component.html',
  styleUrl: './aircraft.component.scss'
})
export class CrewListComponent implements OnInit {
  private refreshAction$ = new BehaviorSubject<void>(undefined);

  vm$: Observable<{
    loading: boolean;
    availableCrew: Crew[];
    assignedCrew: Crew[];
    flights: Flight[];
    total: number;
  }>;

  crewForm!: FormGroup;
  showForm = false;

  editingCrewId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private crewService: CrewService,
    private flightService: FlightService
  ) {
    this.initializeForm();

    const flights$ = this.flightService.getAllFlights().pipe(
      startWith([]),
      catchError(() => of([]))
    );

    const crew$ = this.refreshAction$.pipe(
      switchMap(() => this.crewService.getAllCrew().pipe(
        startWith(null),
        catchError(() => of([]))
      ))
    );

    this.vm$ = combineLatest([crew$, flights$]).pipe(
      map(([crew, flights]) => {
        const crewList = Array.isArray(crew) ? crew : [];
        const flightList = Array.isArray(flights) ? flights : [];

        return {
          loading: crew === null,
          availableCrew: crewList.filter(c => c?.available),
          assignedCrew: crewList.filter(c => !c?.available),
          flights: flightList,
          total: crewList.length
        };
      }),
      // Guarantee initial state
      startWith({
        loading: true,
        availableCrew: [],
        assignedCrew: [],
        flights: [],
        total: 0
      })
    );
  }

  ngOnInit() { }

  initializeForm() {
    this.crewForm = this.fb.group({
      name: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  loadCrew() {
    this.refreshAction$.next();
  }

  openForm(member?: Crew) {
    this.showForm = true;
    if (member) {
      this.editingCrewId = member.id;
      this.crewForm.patchValue({
        name: member.name,
        role: member.role
      });
    } else {
      this.editingCrewId = null;
      this.crewForm.reset();
    }
  }

  closeForm() {
    this.showForm = false;
    this.editingCrewId = null;
    this.crewForm.reset();
  }

  onSubmit() {
    if (this.crewForm.invalid) return;

    const request = this.crewForm.value;
    if (this.editingCrewId) {
      this.crewService.updateCrew(this.editingCrewId, request).subscribe({
        next: () => { this.loadCrew(); this.closeForm(); },
        error: () => { }
      });
    } else {
      this.crewService.addCrew(request).subscribe({
        next: () => { this.loadCrew(); this.closeForm(); },
        error: () => { }
      });
    }
  }

  onDelete(id: number) {
    if (confirm('Are you sure you want to delete this crew member?')) {
      this.crewService.deleteCrew(id).subscribe({
        next: () => this.loadCrew(),
        error: () => { }
      });
    }
  }

  onUnassign(id: number) {
    if (confirm('Unassign this crew member from their current flight?')) {
      this.crewService.unassignCrew(id).subscribe({
        next: () => this.loadCrew(),
        error: () => { }
      });
    }
  }
}
