import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flight, FlightRequest, FlightSearchParams } from '../models/flight.model';
import { Aircraft } from '../models/aircraft.model';

@Injectable({ providedIn: 'root' })
export class FlightService {
  private baseUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) { }

  // Admin endpoints
  getAllFlights(): Observable<Flight[]> {
    return this.http.get<Flight[]>(`${this.baseUrl}/admin/flights`);
  }

  createFlight(flight: FlightRequest): Observable<Flight> {
    return this.http.post<Flight>(`${this.baseUrl}/admin/create/flights`, flight);
  }

  updateFlight(id: number, flight: FlightRequest): Observable<Flight> {
    return this.http.put<Flight>(`${this.baseUrl}/admin/flights/${id}`, flight);
  }

  deleteFlight(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/flights/${id}`);
  }

  assignAircraft(flightId: number, aircraftId: number): Observable<Flight> {
    return this.http.put<Flight>(
      `${this.baseUrl}/admin/flights/${flightId}/assign-aircraft/${aircraftId}`,
      {}
    );
  }

  getAvailableAircraft(excludeFlightId?: number): Observable<Aircraft[]> {
    let params = new HttpParams();
    if (excludeFlightId) {
      params = params.set('excludeFlightId', excludeFlightId.toString());
    }
    return this.http.get<Aircraft[]>(`${this.baseUrl}/admin/aircraft/available`, { params });
  }

  // Customer endpoints
  searchFlights(params: FlightSearchParams): Observable<Flight[]> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('source', params.source || '');
    httpParams = httpParams.set('destination', params.destination || '');
    httpParams = httpParams.set('date', params.date || '');

    return this.http.get<Flight[]>(`${this.baseUrl}/customer/flights/search`, { params: httpParams });
  }
}
