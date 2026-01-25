export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export interface AuthPayload {
  userId: number;
  username: string;
  role: 'ADMIN' | 'CUSTOMER';
  iat: number;
  exp: number;
}
