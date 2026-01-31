import { Flight } from './flight.model';
import { Passenger } from './passenger.model';

export interface Booking {
  id: number;
  flight: Flight;
  passenger: Passenger;
  seatsBooked: number;
  status: string;
  totalAmount: number;
  passengers?: BookingPassenger[];
}

export interface BookingPassenger {
  id?: number;
  name: string;
  age: number;
  gender: string;
  contact: string;
  passportId: string;
  email: string;
  checkedIn?: boolean;
  seatNumber?: string;
}

export interface BookingRequest {
  passengerId?: number;
  username: string;
  flightId: number;
  seats: number;
  name: string;
  email: string;
  passengerDetails: BookingPassenger[];
}

export interface Payment {
  id: number;
  bookingId: number;
  paymentMode: 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'UPI';
  amount: number;
  status: string;
  transactionId: string;
}

export interface PaymentRequest {
  bookingId: number;
  paymentMode: 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'UPI';
  amount: number;
}

export interface BoardingPass {
  id: number;
  boardingNumber: string;
  booking: Booking;
  bookingPassenger?: BookingPassenger;
  gate: string;
  seatNumber: string;
  boardingTime: string;
  status: string;
}

export interface CheckInResponse {
  success: boolean;
  boardingPasses: BoardingPass[];
}
