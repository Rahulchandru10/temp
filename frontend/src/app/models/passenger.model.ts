export interface Passenger {
  id: number;
  name: string;
  email: string;
  status: string;
}

export interface PassengerRequest {
  name: string;
  email: string;
}

export interface CheckInRequest {
  passengerId: number;
  seatNumber: string;
}

export interface CheckInResponse {
  success: boolean;
  boardingPass: BoardingPass;
}

export interface BoardingPass {
  id: number;
  passengerId: number;
  flightId: number;
  seatNumber: string;
  boardingTime: string;
  boardingNumber: string;
  gate: string;
  status: string;
}
