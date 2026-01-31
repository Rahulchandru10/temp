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
