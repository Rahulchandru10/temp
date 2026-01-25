export interface Crew {
  id: number;
  name: string;
  role: string;
  available: boolean;
}

export interface CrewRequest {
  name: string;
  role: string;
}

export interface CrewAssignment {
  crewId: number;
  flightId: number;
}
