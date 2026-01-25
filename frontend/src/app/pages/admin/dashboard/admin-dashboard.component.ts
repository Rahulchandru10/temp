import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { FlightListComponent } from '../aircraft/flight-list.component';
import { AircraftListComponent } from '../aircraft/aircraft-list.component';
import { CrewListComponent } from '../aircraft/crew-list.component';
import { ReadinessCheckComponent } from '../aircraft/readiness-check.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FlightListComponent, AircraftListComponent, CrewListComponent, ReadinessCheckComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'flights';

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/login']);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  logout() {
    this.auth.logout();
  }
}
