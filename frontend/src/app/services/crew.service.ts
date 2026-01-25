import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Crew, CrewRequest } from '../models/crew.model';

@Injectable({ providedIn: 'root' })
export class CrewService {
  private baseUrl = 'http://localhost:8080/api/admin/crew';

  constructor(private http: HttpClient) { }

  getAllCrew(): Observable<Crew[]> {
    return this.http.get<Crew[]>(this.baseUrl);
  }

  addCrew(crew: CrewRequest): Observable<Crew> {
    return this.http.post<Crew>(this.baseUrl, crew);
  }

  assignCrewToFlight(crewId: number, flightId: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/assign/${crewId}/${flightId}`,
      {}
    );
  }

  unassignCrew(crewId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/unassign/${crewId}`);
  }
}
