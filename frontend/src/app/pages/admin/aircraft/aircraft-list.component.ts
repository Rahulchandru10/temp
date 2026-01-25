import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AircraftService } from '../../../services/aircraft.service';
import { Aircraft, AircraftRequest } from '../../../models/aircraft.model';

@Component({
  selector: 'app-aircraft-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './aircraft-list.component.html',
  styleUrl: './aircraft.component.scss'
})
export class AircraftListComponent implements OnInit {
  aircraft$!: Observable<Aircraft[]>;
  private refreshSubject = new BehaviorSubject<void>(undefined);
  aircraftForm!: FormGroup;
  showForm = false;
  editingId: number | null = null;
  error = '';

  constructor(
    private fb: FormBuilder,
    private aircraftService: AircraftService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.aircraft$ = this.refreshSubject.asObservable().pipe(
      switchMap(() => {
        console.log('Loading aircraft...');
        this.error = '';
        return this.aircraftService.getAllAircraft().pipe(
          catchError(err => {
            console.error('Error loading aircraft list:', err);
            this.error = 'Failed to load aircraft list';
            return of([]);
          })
        );
      })
    );
  }

  initializeForm() {
    this.aircraftForm = this.fb.group({
      name: ['', Validators.required],
      model: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]]
    });
  }

  loadAircraft() {
    console.log('Triggering aircraft load...');
    this.refreshSubject.next();
  }

  openForm() {
    this.showForm = true;
    this.editingId = null;
    this.aircraftForm.reset();
  }

  closeForm() {
    this.showForm = false;
    this.aircraftForm.reset();
  }

  onSubmit() {
    if (this.aircraftForm.invalid) {
      console.warn('Form invalid:', this.aircraftForm.errors);
      return;
    }

    const formValue: AircraftRequest = this.aircraftForm.value;
    console.log('Submitting aircraft:', formValue);

    if (this.editingId) {
      this.aircraftService.updateAircraft(this.editingId, formValue).subscribe({
        next: (response) => {
          console.log('Aircraft updated:', response);
          this.loadAircraft();
          this.closeForm();
        },
        error: (err) => {
          console.error('Update error:', err);
          this.error = 'Failed to update aircraft: ' + (err?.error?.message || err?.message || 'Unknown error');
        }
      });
    } else {
      this.aircraftService.createAircraft(formValue).subscribe({
        next: (response) => {
          console.log('Aircraft created:', response);
          this.loadAircraft();
          this.closeForm();
        },
        error: (err) => {
          console.error('Create error:', err);
          this.error = 'Failed to create aircraft: ' + (err?.error?.message || err?.message || 'Unknown error');
        }
      });
    }
  }

  edit(ac: Aircraft) {
    this.editingId = ac.id;
    this.aircraftForm.patchValue(ac);
    this.showForm = true;
  }

  delete(id: number) {
    if (confirm('Are you sure?')) {
      this.aircraftService.deleteAircraft(id).subscribe({
        next: () => {
          console.log('Aircraft deleted successfully');
          this.loadAircraft();
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.error = 'Failed to delete aircraft: ' + (err?.error?.message || err?.message || 'Unknown error');
        }
      });
    }
  }
}
