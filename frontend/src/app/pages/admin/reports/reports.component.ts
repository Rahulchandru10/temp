import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../../services/reports.service';
import { Observable, forkJoin } from 'rxjs';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
    summary$: Observable<any>;
    flightReport$: Observable<any[]>;
    revenueReport$: Observable<any[]>;

    constructor(private reportsService: ReportsService) {
        this.summary$ = this.reportsService.getSummary();
        this.flightReport$ = this.reportsService.getFlightReport();
        this.revenueReport$ = this.reportsService.getRevenueByFlight();
    }

    ngOnInit(): void { }
}
