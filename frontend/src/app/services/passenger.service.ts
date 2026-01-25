import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Passenger, PassengerRequest, CheckInRequest, CheckInResponse } from '../models/passenger.model';

@Injectable({ providedIn: 'root' })
export class PassengerService {
  private baseUrl = 'http://localhost:8080/api/customer/passenger';

  constructor(private http: HttpClient) { }

  addPassenger(passenger: PassengerRequest): Observable<Passenger> {
    return this.http.post<Passenger>(this.baseUrl, passenger);
  }

  checkInPassenger(bookingId: number, seat: string): Observable<CheckInResponse> {
    return this.http.post<CheckInResponse>(
      `${this.baseUrl}/checkin`,
      {},
      { params: { bookingId: bookingId.toString(), seat } }
    );
  }

  getPassengerByUsername(username: string): Observable<Passenger> {
    return this.http.get<Passenger>(`${this.baseUrl}/by-username`, { params: { username } });
  }
}
