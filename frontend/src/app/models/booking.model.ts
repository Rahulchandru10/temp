import { Flight } from './flight.model';
import { Passenger } from './passenger.model';

export interface Booking {
  id: number;
  flight: Flight;
  passenger: Passenger;
  seatsBooked: number;
  status: string;
  totalAmount: number;
}

export interface BookingRequest {
  passengerId?: number;
  username: string;
  flightId: number;
  seats: number;
  name: string;
  email: string;
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
