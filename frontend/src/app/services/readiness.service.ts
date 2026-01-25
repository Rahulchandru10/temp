import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReadinessCheck } from '../models/aircraft.model';

@Injectable({ providedIn: 'root' })
export class ReadinessService {
  private baseUrl = 'http://localhost:8080/auth/admin';

  constructor(private http: HttpClient) { }

  checkFlightReadiness(flightId: number): Observable<ReadinessCheck> {
    return this.http.get<ReadinessCheck>(`${this.baseUrl}/readiness/${flightId}`);
  }
}
