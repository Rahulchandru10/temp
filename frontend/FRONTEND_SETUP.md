# Airline Management System - Frontend Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- npm 9+ (comes with Node.js)
- Angular CLI 18+ (`npm install -g @angular/cli@18`)

### 2. Installation

```bash
# Navigate to project directory
cd d:\Projects\airline_management

# Install dependencies
npm install
```

### 3. Configuration

Update API endpoint in services if your backend is on a different URL:

**File:** `src/app/services/*.service.ts`

Change:
```typescript
private baseUrl = 'http://localhost:8080/api';
```

To your backend URL.

### 4. Start Development Server

```bash
npm start
```

Server runs on `http://localhost:4200/`

### 5. Login

Demo credentials:

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Customer Account:**
- Username: `customer`
- Password: `customer123`

## Project Structure

```
src/
├── app/
│   ├── core/auth/         ← Authentication & Guards
│   ├── models/            ← TypeScript interfaces
│   ├── services/          ← HTTP services
│   └── pages/             ← Components
├── styles.css             ← Global styles
├── main.ts                ← Entry point
└── index.html             ← HTML template
```

## Key Files

### Services to Update API Endpoint

All services use `http://localhost:8080/api` as base URL. Update these files if needed:

- `src/app/core/auth/auth.service.ts`
- `src/app/services/flight.service.ts`
- `src/app/services/aircraft.service.ts`
- `src/app/services/crew.service.ts`
- `src/app/services/passenger.service.ts`
- `src/app/services/booking.service.ts`
- `src/app/services/boarding-pass.service.ts`
- `src/app/services/readiness.service.ts`

## Development Commands

```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test

# Format code
npm run lint
```

## Backend Requirements

Your Spring Boot backend must:

1. Run on `http://localhost:8080` (or update API URLs)
2. Have CORS enabled
3. Implement JWT token generation on `/api/login`
4. Add `Authorization: Bearer <token>` header support
5. Return 401 for expired/invalid tokens

### CORS Configuration Example (Spring Boot)

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:4200")
            .allowedMethods("*")
            .allowCredentials(true);
    }
}
```

## Troubleshooting

### "Cannot find module" errors

```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

### Port 4200 already in use

```bash
# Use a different port
ng serve --port 4300
```

### CORS errors

- Verify backend is running
- Check CORS is enabled in backend
- Ensure API URL matches in all services

### Login not working

1. Check if backend is running on port 8080
2. Verify credentials (admin/admin123, customer/customer123)
3. Check browser console for error messages
4. Verify JWT endpoint is `/api/login`

## Architecture

### Authentication Flow

1. User enters credentials on Login page
2. AuthService sends POST to `/api/login`
3. Backend returns JWT token
4. Token stored in localStorage
5. TokenInterceptor adds token to all subsequent requests
6. Routes protected by AuthGuard and RoleGuard

### Data Flow

```
Component
    ↓
Service (HTTP)
    ↓
TokenInterceptor (adds JWT)
    ↓
Backend API
    ↓
Response → Service → Component
```

## Component Navigation

### Admin Flow
```
Login → Admin Dashboard
         ├── Flight Management
         ├── Aircraft Management
         ├── Crew Management
         └── Readiness Check
```

### Customer Flow
```
Login → Customer Dashboard
         ├── Flight Search
         ├── Booking
         ├── Check-in
         └── Boarding Pass
```

## Theme Customization

Update colors in `src/styles.css`:

```css
:root {
  --bg-dark: #1e1e2f;           /* Main background */
  --bg-card: #2a2a3d;           /* Card background */
  --primary: #3a3dcb;           /* Primary button */
  --text-primary: #f3f3f3;      /* Main text */
  --text-secondary: #a0a0b0;    /* Secondary text */
  --success: #10b981;           /* Success state */
  --error: #ef4444;             /* Error state */
}
```

## Building for Production

```bash
# Build optimized bundle
npm run build

# Output in dist/ directory
# Deploy dist/airline_management to your server
```

## Further Documentation

- [Angular Documentation](https://angular.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)

## Support

For issues:
1. Check the browser console for errors
2. Verify backend is running
3. Review backend logs
4. Check network tab in DevTools

---

**Backend Documentation:** See backend README for API specifications.
