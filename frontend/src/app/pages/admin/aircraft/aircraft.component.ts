import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightListComponent } from './flight-list.component';

@Component({
  selector: 'app-aircraft',
  standalone: true,
  imports: [CommonModule, FlightListComponent],
  templateUrl: './aircraft.component.html',
  styleUrls: ['./aircraft.component.scss']
})
export class AircraftComponent {
  // This component is kept for backward compatibility
  // Real aircraft management is in AircraftListComponent
}
