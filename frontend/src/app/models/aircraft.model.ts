export interface Aircraft {
  id: number;
  name: string;
  model: string;
  capacity: number;
  status: string;
}

export interface AircraftRequest {
  name: string;
  model: string;
  capacity: number;
}

export interface AircraftAssignment {
  aircraftId: number;
  flightId: number;
}

export interface ReadinessCheck {
  flightId: number;
  isReady: boolean;
  message: string;
}
