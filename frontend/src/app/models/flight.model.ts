export interface Flight {
  id: number;
  flightNumber: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  aircraftId: number;
  price: number;
  status: string;
}

export interface FlightRequest {
  flightNumber: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  aircraftId: number;
  price: number;
}

export interface FlightSearchParams {
  source: string;
  destination: string;
  date: string;
}
