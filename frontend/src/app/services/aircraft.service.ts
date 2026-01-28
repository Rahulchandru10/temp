import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Aircraft, AircraftRequest } from '../models/aircraft.model';

@Injectable({ providedIn: 'root' })
export class AircraftService {
  private baseUrl = 'http://localhost:8080/admin/aircraft';

  constructor(private http: HttpClient) { }

  getAllAircraft(): Observable<Aircraft[]> {
    console.log('Calling getAllAircraft endpoint...');
    return this.http.get<Aircraft[]>(`${this.baseUrl}/getall`).pipe(
      tap(data => console.log('getAllAircraft response:', data)),
      catchError(err => {
        console.error('getAllAircraft error:', err);
        throw err;
      })
    );
  }

  createAircraft(aircraft: AircraftRequest): Observable<Aircraft> {
    console.log('Calling createAircraft with:', aircraft);
    return this.http.post<Aircraft>(`${this.baseUrl}/create`, aircraft).pipe(
      tap(data => console.log('createAircraft response:', data)),
      catchError(err => {
        console.error('createAircraft error:', err);
        throw err;
      })
    );
  }

  updateAircraft(id: number, aircraft: AircraftRequest): Observable<Aircraft> {
    console.log('Calling updateAircraft with id:', id, 'and data:', aircraft);
    return this.http.put<Aircraft>(`${this.baseUrl}/${id}`, aircraft).pipe(
      tap(data => console.log('updateAircraft response:', data)),
      catchError(err => {
        console.error('updateAircraft error:', err);
        throw err;
      })
    );
  }

  deleteAircraft(id: number): Observable<void> {
    console.log('Calling deleteAircraft with id:', id);
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => console.log('deleteAircraft successful')),
      catchError(err => {
        console.error('deleteAircraft error:', err);
        throw err;
      })
    );
  }

  assignAircraftToFlight(aircraftId: number, flightId: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/flights/assign/${aircraftId}/${flightId}`,
      {}
    );
  }
}
