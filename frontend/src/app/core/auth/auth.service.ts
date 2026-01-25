import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { LoginRequest, LoginResponse, AuthPayload, RegisterRequest } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/auth';
  private currentUser = new BehaviorSubject<AuthPayload | null>(null);
  public currentUser$ = this.currentUser.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Only load token in browser environment
    if (this.isBrowser()) {
      this.loadUserFromToken();
    }
  }

  private isBrowser(): boolean {
    return typeof document !== 'undefined' && typeof localStorage !== 'undefined';
  }

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => {
        if (this.isBrowser()) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', res.role);
        }
        const payload = this.decodeToken(res.token);
        this.currentUser.next(payload);
      })
    );
  }

  register(user: RegisterRequest) {
    return this.http.post<any>(`${this.baseUrl}/register`, user);
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
    this.currentUser.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('role');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isCustomer(): boolean {
    return this.getRole() === 'CUSTOMER';
  }

  private decodeToken(token: string): AuthPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private loadUserFromToken() {
    const token = this.getToken();
    if (token) {
      const payload = this.decodeToken(token);
      this.currentUser.next(payload);
    }
  }
}
