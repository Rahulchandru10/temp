import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Booking, BookingRequest, Payment, PaymentRequest } from '../models/booking.model';
import { Flight } from '../models/flight.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
    private baseUrl = 'http://localhost:8080/api/customer/booking';
    private selectedFlightSource = new BehaviorSubject<Flight | null>(null);
    public selectedFlight$ = this.selectedFlightSource.asObservable();

    constructor(private http: HttpClient) { }

    selectFlight(flight: Flight) {
        this.selectedFlightSource.next(flight);
    }

    bookFlight(booking: BookingRequest): Observable<Booking> {
        return this.http.post<Booking>(this.baseUrl, booking);
    }

    makePayment(payment: PaymentRequest): Observable<Payment> {
        return this.http.post<Payment>(`${this.baseUrl}/pay`, {}, {
            params: {
                bookingId: payment.bookingId.toString(),
                mode: payment.paymentMode
            }
        });
    }

    getBookings(passengerId: number): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.baseUrl}/${passengerId}`);
    }

    cancelBooking(bookingId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${bookingId}`);
    }
}
