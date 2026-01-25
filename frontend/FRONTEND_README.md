# Airline Management System - Angular Frontend

A comprehensive Angular 18+ standalone application for airline management with role-based dashboards for both Admin and Customer users.

## Features

### Authentication
- ✅ JWT-based login system
- ✅ Role-based access control (Admin/Customer)
- ✅ Token stored in localStorage
- ✅ Automatic token refresh and interceptor
- ✅ 401 error handling with auto-logout

### Admin Dashboard
- ✅ Flight Management (CRUD operations)
- ✅ Aircraft Management (CRUD operations)
- ✅ Crew Management (Add/List crew)
- ✅ Aircraft Readiness Check
- ✅ Assign aircraft to flights
- ✅ Assign crew to flights

### Customer Dashboard
- ✅ Flight Search & Filtering
- ✅ Passenger Registration
- ✅ Flight Booking
- ✅ Payment Processing
- ✅ Check-in with seat selection
- ✅ Boarding Pass retrieval

## Project Structure

```
src/app/
├── core/
│   └── auth/
│       ├── auth.service.ts          # Authentication logic
│       ├── auth.guard.ts            # Route protection
│       ├── role.guard.ts            # Role-based protection
│       └── token.interceptor.ts     # HTTP interceptor for JWT
├── models/
│   ├── auth.model.ts                # Authentication interfaces
│   ├── aircraft.model.ts            # Aircraft interfaces
│   ├── flight.model.ts              # Flight interfaces
│   ├── crew.model.ts                # Crew interfaces
│   ├── passenger.model.ts           # Passenger/Boarding pass
│   └── booking.model.ts             # Booking/Payment interfaces
├── services/
│   ├── flight.service.ts            # Flight API calls
│   ├── aircraft.service.ts          # Aircraft API calls
│   ├── crew.service.ts              # Crew API calls
│   ├── passenger.service.ts         # Passenger API calls
│   ├── booking.service.ts           # Booking/Payment API
│   ├── boarding-pass.service.ts     # Boarding pass API
│   └── readiness.service.ts         # Flight readiness API
├── pages/
│   ├── login/
│   │   ├── login.component.ts
│   │   ├── login.component.html
│   │   └── login.component.scss
│   ├── admin/
│   │   ├── dashboard/
│   │   │   ├── admin-dashboard.component.ts
│   │   │   ├── admin-dashboard.component.html
│   │   │   └── admin-dashboard.component.scss
│   │   └── aircraft/
│   │       ├── flight-list.component.ts
│   │       ├── aircraft-list.component.ts
│   │       ├── crew-list.component.ts
│   │       ├── readiness-check.component.ts
│   │       ├── flight-list.component.html
│   │       ├── aircraft-list.component.html
│   │       ├── crew-list.component.html
│   │       ├── readiness-check.component.html
│   │       └── aircraft.component.scss
│   └── customer/
│       ├── customer-dashboard.component.ts
│       ├── customer-dashboard.component.html
│       ├── customer-dashboard.component.scss
│       └── customer/
│           ├── flight-search.component.ts
│           ├── booking.component.ts
│           ├── check-in.component.ts
│           ├── boarding-pass.component.ts
│           ├── flight-search.component.html
│           ├── booking.component.html
│           ├── check-in.component.html
│           ├── boarding-pass.component.html
│           └── customer.component.scss
├── app.routes.ts                    # Application routing
├── app.config.ts                    # Application configuration
├── app.ts                           # Root component
├── app.html                         # Root template
└── app.css                          # Component styles

src/
├── styles.css                       # Global styles
├── main.ts                          # Application entry point
└── index.html                       # HTML template
```

## API Endpoints

### Authentication
- `POST /api/login` - Login with username/password

### Flights (Admin)
- `GET /api/admin/flights` - List all flights
- `POST /api/admin/flights` - Create flight
- `PUT /api/admin/flights/{id}` - Update flight
- `DELETE /api/admin/flights/{id}` - Delete flight

### Flights (Customer)
- `GET /api/customer/flights?source=&destination=` - Search flights

### Aircraft (Admin)
- `GET /api/admin/aircraft` - List all aircraft
- `POST /api/admin/aircraft` - Create aircraft
- `PUT /api/admin/aircraft/{id}` - Update aircraft
- `DELETE /api/admin/aircraft/{id}` - Delete aircraft
- `POST /api/admin/aircraft/assign/{aircraftId}/{flightId}` - Assign aircraft

### Crew (Admin)
- `GET /api/admin/crew` - List all crew
- `POST /api/admin/crew` - Add crew member
- `POST /api/admin/crew/assign/{crewId}/{flightId}` - Assign crew to flight

### Passenger (Customer)
- `POST /api/passenger` - Add passenger
- `POST /api/passenger/checkin/{passengerId}?seatNumber=` - Check-in passenger

### Booking & Payment (Customer)
- `POST /api/booking` - Book flight
- `POST /api/payment` - Make payment

### Boarding Pass (Customer)
- `GET /api/boardingpass/{passengerId}` - Get boarding pass

### Aircraft Readiness (Admin)
- `GET /api/admin/readiness/{flightId}` - Check flight readiness

## Theme Colors

The application uses a dark theme with the following color scheme:

```css
Background: #1e1e2f
Cards: #2a2a3d
Primary: #3a3dcb
Secondary: #2563eb
Text: #f3f3f3
Muted Text: #a0a0b0
Border: #3a3a4d
Success: #10b981
Error: #ef4444
```

## Running the Application

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/` in your browser.

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Running Tests

```bash
npm test
```

## Key Components

### LoginComponent
Standalone component with reactive forms for user authentication. Routes to admin or customer dashboard based on user role.

### AdminDashboardComponent
Main admin interface with tabbed navigation:
- Flight Management
- Aircraft Management
- Crew Management
- Aircraft Readiness Check

### CustomerDashboardComponent
Main customer interface with tabbed navigation:
- Flight Search
- Booking Management
- Check-in
- Boarding Pass

### Shared Services
All services are provided at root level and implement HTTP communication with JWT authentication.

## Forms

### Reactive Forms Implementation
All forms use Angular Reactive Forms with validation:
- Required field validation
- Email validation
- Number validation
- Min/Max constraints
- Custom error messages

### Form Validation
- Real-time validation feedback
- Disabled submit buttons for invalid forms
- Error message display for each field

## Security

### Authentication & Authorization
- JWT tokens stored in localStorage
- Token interceptor attaches JWT to all requests
- Role-based guards protect routes
- 401 errors trigger logout and redirect to login

### Guards
- `AuthGuard`: Checks if user is logged in
- `RoleGuard`: Checks if user has required role

## Styling

### SCSS Architecture
- Global styles in `styles.css`
- Component-scoped styles for each component
- CSS variables for theming
- Flexbox and Grid for layouts
- Mobile-responsive design with media queries

### Design System
- Consistent spacing using padding/margin
- Gradient buttons and active states
- Hover effects for interactivity
- Smooth transitions for all interactive elements
- Cards with shadows for depth

## Browser Support

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Angular CLI 18+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm build
```

## Demo Credentials

```
Admin:
Username: admin
Password: admin123

Customer:
Username: customer
Password: customer123
```

## Environment Configuration

Update the API base URL in services if needed:

```typescript
private baseUrl = 'http://localhost:8080/api';
```

## Performance Optimization

- Standalone components for efficient bundling
- OnPush change detection strategy
- Lazy loading ready (routes can be lazy-loaded)
- Tree-shakeable providers
- Minimal dependencies

## Development Tips

### Adding New Features

1. Create models in `src/app/models/`
2. Create service in `src/app/services/`
3. Create component in appropriate page folder
4. Update routing if needed
5. Import components in parent components

### Component Creation

Use Angular CLI for scaffolding:

```bash
ng generate component pages/admin/new-feature/my-component --standalone
```

## Troubleshooting

### CORS Issues
Ensure backend is running on `http://localhost:8080` and has CORS enabled.

### Token Expiration
Update token refresh logic in `TokenInterceptor` as needed.

### Routes Not Working
Verify routes in `app.routes.ts` match component imports.

## Future Enhancements

- [ ] Email notifications for bookings
- [ ] Real-time flight status updates with WebSocket
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] PDF boarding pass generation
- [ ] Seat availability map
- [ ] Passenger management for admins
- [ ] Revenue reports

## Contributing

1. Follow Angular style guide
2. Use standalone components
3. Keep components focused and small
4. Add proper error handling
5. Include proper TypeScript typing

## License

MIT