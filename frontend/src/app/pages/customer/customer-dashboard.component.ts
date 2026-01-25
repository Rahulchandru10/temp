import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { BookingService } from '../../services/booking.service';
import { FlightSearchComponent } from './customer/flight-search.component';
import { BookingComponent } from './customer/booking.component';
import { CheckInComponent } from './customer/check-in.component';
import { BoardingPassComponent } from './customer/boarding-pass.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FlightSearchComponent, BookingComponent, CheckInComponent, BoardingPassComponent],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.scss'
})
export class CustomerDashboardComponent implements OnInit {
  activeTab = 'search';

  constructor(
    private auth: AuthService,
    private router: Router,
    private bookingService: BookingService
  ) { }

  ngOnInit() {
    if (!this.auth.isCustomer()) {
      this.router.navigate(['/login']);
      return;
    }

    // Automatically switch to booking tab when a flight is selected
    this.bookingService.selectedFlight$.subscribe(flight => {
      if (flight) {
        this.activeTab = 'booking';
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab !== 'booking') {
      this.bookingService.selectFlight(null as any); // Clear selection if user manually switches away (optional)
    }
  }

  logout() {
    this.auth.logout();
  }
}
