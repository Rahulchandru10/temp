import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoardingPass } from '../models/passenger.model';

@Injectable({ providedIn: 'root' })
export class BoardingPassService {
  private baseUrl = 'http://localhost:8080/api/customer/passenger';

  constructor(private http: HttpClient) { }

  getBoardingPass(bookingId: number): Observable<BoardingPass> {
    return this.http.get<BoardingPass>(`${this.baseUrl}/boardingpass/${bookingId}`);
  }
}
