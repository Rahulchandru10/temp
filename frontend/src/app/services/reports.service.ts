import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportsService {
    private baseUrl = 'http://localhost:8080/api/admin/reports';

    constructor(private http: HttpClient) { }

    getSummary(): Observable<any> {
        return this.http.get(`${this.baseUrl}/summary`);
    }

    getFlightReport(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/flights`);
    }

    getRevenueByFlight(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/revenue-by-flight`);
    }
}
