# Component Interaction & Data Flow Guide

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular Frontend                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Application Shell (App.ts)                 │   │
│  │              └── RouterOutlet                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                    │
│     ┌────────────────────┼────────────────────┐              │
│     │                    │                    │              │
│     ▼                    ▼                    ▼              │
│  LoginComponent   AdminDashboard    CustomerDashboard        │
│                        │                    │               │
│     ┌──────────────────┼──────────────────┬─┴──────────────┐│
│     │                  │                  │                 ││
│     ▼                  ▼                  ▼                 ▼│
│  AuthService    FlightList          FlightSearch        Form │
│  AuthGuard      AircraftList        Booking              Components
│  RoleGuard      CrewList            CheckIn              
│  Interceptor    ReadinessCheck      BoardingPass        
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              HTTP Interceptor & Services             │   │
│  │  - TokenInterceptor (JWT attachment)                │   │
│  │  - FlightService    - PassengerService              │   │
│  │  - AircraftService  - BookingService                │   │
│  │  - CrewService      - BoardingPassService           │   │
│  │  - ReadinessService                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                    │
│                          ▼                                    │
│        ┌────────────────────────────────────┐               │
│        │  HTTP Client (Angular HttpClient)  │               │
│        │  Authorization: Bearer <JWT>       │               │
│        └────────────────────────────────────┘               │
│                          │                                    │
└──────────────────────────┼────────────────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │   Spring Boot Backend         │
            │   (http://localhost:8080)    │
            │                              │
            │  - Authentication Endpoints  │
            │  - Flight API                │
            │  - Aircraft API              │
            │  - Crew API                  │
            │  - Passenger API             │
            │  - Booking API               │
            │  - Payment API               │
            │  - Boarding Pass API         │
            └──────────────────────────────┘
```

## Authentication Flow

```
User enters credentials
        │
        ▼
   LoginComponent
        │
        ├─→ Validates form (ReactiveForm)
        │
        ├─→ AuthService.login(credentials)
        │
        ├─→ HTTP POST /api/login
        │
        ├─→ Backend validates & returns JWT
        │
        ├─→ Store JWT in localStorage
        │
        ├─→ Decode JWT & extract user info
        │
        └─→ Router navigates based on role
            ├─→ ADMIN → /admin/dashboard
            └─→ CUSTOMER → /customer/dashboard
```

## Data Flow: Admin - Flight Management

```
┌─────────────────────────────────────────────────────────────┐
│                  AdminDashboardComponent                     │
│                   activeTab = 'flights'                      │
└──────────────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
                      ┌────────────────────────┐
                      │  FlightListComponent   │
                      │  - flights: Flight[]   │
                      │  - flightForm: Form    │
                      │  - showForm: boolean   │
                      └────────────┬───────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
              Load Flights    Show Form       Submit Form
                    │              │              │
                    ├──→ Service   ├──→ Form     └──→ validate
                    │   getAllFlights  Validation  └──→ Service
                    │                   ├──→ Show     createFlight()
            ┌──────────────┐            │   errors    or
            │ HTTP GET     │            │             updateFlight()
            │ /admin/      │            ▼             │
            │ flights      │         FormGroup        │
            │              │         .invalid = false │
            └──────┬───────┘                          │
                   │                                  ▼
                   │                          ┌────────────────┐
                   │                          │ HTTP POST/PUT  │
                   │                          │ /admin/flights │
                   │                          └────────┬───────┘
                   │                                   │
                   └───────────────┬───────────────────┘
                                   │
                    ┌──────────────┬──────────────┐
                    │              │              │
                    ▼              ▼              ▼
                 Success        Error         Reload
                    │              │            Flights
                    │              │            │
                    ├─→ Reset Form │            └──→ Re-fetch
                    ├─→ Reload List ├──→ Show Error  from API
                    └─→ Close Form   Alert


             Display in Table
                    │
                    ▼
        ┌──────────────────────────┐
        │ Render Flight Records    │
        │ ├─ Flight Number         │
        │ ├─ Route                 │
        │ ├─ Times                 │
        │ ├─ Price                 │
        │ ├─ Status                │
        │ └─ Actions (Edit/Delete) │
        └──────────────────────────┘
```

## Data Flow: Customer - Flight Search & Booking

```
┌──────────────────────────────────────────────────────────────┐
│            CustomerDashboardComponent                         │
│            - activeTab: 'search' | 'booking' | ...           │
└──────────┬───────────────────────────────────────────────────┘
           │
           ├─ Search Tab ─────────────────────────┐
           │                                       │
           ▼                                       ▼
    ┌─────────────────────┐         ┌──────────────────────────┐
    │ FlightSearchComp.   │         │  BookingComponent        │
    │ - searchForm        │         │  - Step 1: Passenger     │
    │ - flights[]         │         │  - Step 2: Select Flight │
    │                     │         │  - Step 3: Payment       │
    └────────┬────────────┘         └────────┬─────────────────┘
             │                               │
             ▼                               ▼
      ┌─────────────┐              ┌────────────────┐
      │ User enters │              │ PassengerForm  │
      │ Search data │              │ validate()     │
      └──────┬──────┘              │ addPassenger() │
             │                     └────────┬───────┘
             ▼                              │
      FlightService                        ▼
      .searchFlights()           ┌─────────────────────┐
             │                   │ HTTP POST           │
             ▼                   │ /passenger          │
      ┌──────────────┐           └────────┬────────────┘
      │ HTTP GET     │                    │
      │ /customer/   │                    ▼
      │ flights      │           ┌──────────────────┐
      │ ?source=...  │           │ BookingForm      │
      │ &destination │           │ Select Flight    │
      │ =...         │           └────────┬─────────┘
      └──────┬───────┘                    │
             │                             ▼
             │                    FlightService
             │                    .getAllFlights()
             │                             │
             ▼                             ▼
      ┌──────────────┐            ┌──────────────┐
      │ Display      │            │ HTTP POST    │
      │ Flight Cards │            │ /booking     │
      │ - Route      │            └──────┬───────┘
      │ - Times      │                   │
      │ - Price      │                   ▼
      │ - Book btn   │            ┌──────────────────┐
      └──────────────┘            │ PaymentForm      │
                                   │ Select Payment   │
                                   │ Mode & Amount    │
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   BookingService
                                   .makePayment()
                                            │
                                            ▼
                                   ┌──────────────┐
                                   │ HTTP POST    │
                                   │ /payment     │
                                   └──────┬───────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │ Success!     │
                                   │ Booking Done │
                                   └──────────────┘
```

## Data Flow: Customer - Check-in & Boarding Pass

```
┌──────────────────────────────────────────┐
│       CustomerDashboard                   │
│       - activeTab: 'checkin' | 'boarding' │
└──────────────────┬───────────────────────┘
                   │
                   ├─ Check-in Tab ───────────────┐
                   │                              │
                   ▼                              ▼
        ┌────────────────────┐      ┌────────────────────────┐
        │ CheckInComponent   │      │ BoardingPassComponent  │
        │ - Form             │      │ - passengerId          │
        │ - Result           │      │ - boardingPass         │
        └────────┬───────────┘      └────────┬───────────────┘
                 │                           │
                 ▼                           ▼
        ┌────────────────────┐      ┌────────────────────┐
        │ User fills form:   │      │ User enters ID:    │
        │ - Passenger ID     │      │ - Passenger ID     │
        │ - Flight ID        │      │                    │
        │ - Seat Number      │      └────────┬───────────┘
        └────────┬───────────┘               │
                 │                           ▼
                 ▼                   BoardingPassService
        PassengerService            .getBoardingPass()
        .checkInPassenger()                 │
                 │                         ▼
                 ▼                  ┌──────────────────┐
        ┌─────────────────┐         │ HTTP GET         │
        │ HTTP POST       │         │ /boardingpass/   │
        │ /passenger/     │         │ {passengerId}    │
        │ checkin/{id}    │         └──────┬───────────┘
        │ ?seatNumber=    │                 │
        └────────┬────────┘                 ▼
                 │                  ┌──────────────────┐
                 ▼                  │ Display Pass:    │
        ┌─────────────────┐         │ - Passenger      │
        │ Response with   │         │ - Flight         │
        │ BoardingPass    │         │ - Seat           │
        │ details         │         │ - Boarding Time  │
        └────────┬────────┘         │ - Barcode        │
                 │                  └──────────────────┘
                 ▼
        ┌─────────────────┐
        │ Display:        │
        │ - Seat Number   │
        │ - Boarding Time │
        │ - Pass Barcode  │
        └─────────────────┘
```

## Service Dependency Graph

```
                    ┌─────────────────────┐
                    │   AuthService       │
                    │ - login()           │
                    │ - logout()          │
                    │ - getToken()        │
                    │ - getRole()         │
                    │ - isAdmin()         │
                    │ - isCustomer()      │
                    └──────────┬──────────┘
                               │
                   ┌───────────┼───────────┐
                   │           │           │
                   ▼           ▼           ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │ Guards   │  │ Interceptor  │ Router   │
            │ - Auth   │  │ - Attach JWT │ - Route  │
            │ - Role   │  │ - Handle 401 │ - Redirect
            └──────────┘  └──────────┘  └──────────┘
                   │           │           │
                   └───────────┼───────────┘
                               │
                               ▼
                   ┌─────────────────────┐
                   │   Components        │
                   └─────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
    ┌─────────┐          ┌─────────┐            ┌──────────┐
    │ Flight  │          │Aircraft │            │Passenger │
    │ Service │          │ Service │            │ Service  │
    └────┬────┘          └────┬────┘            └────┬─────┘
         │                    │                     │
    Get/Create/           Get/Create/          Register/
    Update/Delete         Update/Delete         Check-in
    flights               aircraft               passengers


    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Crew Service │  │ Booking Svc  │  │ Readiness Svc│
    └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
           │                 │                  │
      Get/Add Crew      Book Flight      Check Flight
      Assign to         Make Payment     Status
      Flight            Process Payment
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│              Component State                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Local Component State (Component.ts)                   │
│  ├─ form: FormGroup                                    │
│  ├─ loading: boolean                                   │
│  ├─ error: string                                      │
│  ├─ data: T[]                                          │
│  └─ editingId: number | null                           │
│                                                          │
│  Shared State (Observable from Service)                │
│  ├─ currentUser$: Observable<AuthPayload>             │
│  │   └─ Used by: Components needing user info         │
│  └─ Handled by: AuthService                           │
│                                                          │
│  Persistent State (localStorage)                       │
│  ├─ token: JWT string                                  │
│  ├─ role: 'ADMIN' | 'CUSTOMER'                        │
│  └─ Accessed by: AuthService, TokenInterceptor        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
User Action
    │
    ▼
Component Method
    │
    ├─ Validate Input
    │   ├─ Valid ────────────────────┐
    │   │                            │
    │   └─ Invalid ──────────────────┤
    │       └─ Show error message    │
    │                                │
    ▼                                │
Service Method                       │
    │                                │
    ├─ Make HTTP Request             │
    │   │                            │
    │   ├─ Success ────────┐         │
    │   │                  │         │
    │   └─ Error           │         │
    │       ├─ 401: Auth Error      │
    │       │  └─ AuthService.logout()
    │       │     └─ Redirect to login
    │       │                       │
    │       ├─ 4xx: Client Error   │
    │       │  └─ Show error msg    │
    │       │                       │
    │       └─ 5xx: Server Error   │
    │          └─ Show error msg    │
    │                                │
    └────────────────────┬───────────┘
                         │
                         ▼
                    Component Display
                         │
                ┌────────┴────────┐
                │                 │
                ▼                 ▼
            Success         Error Alert
            Update UI       Display Message
```

## Form Validation Flow

```
User Input
    │
    ▼
FormGroup.valueChanges
    │
    ├─ Check: required
    ├─ Check: minLength
    ├─ Check: maxLength
    ├─ Check: pattern
    ├─ Check: email
    └─ Check: custom validators
    │
    ▼
FormControl.errors
    │
    ├─ errors = null  ────→ Control is VALID
    │                         Control marked ✓
    │                         Error message hidden
    │
    └─ errors = {...} ───→ Control is INVALID
                              Control marked ✗
                              Error message shown
                              Submit button disabled

Submit
    │
    ├─ FormGroup.invalid = true
    │   └─ Prevent submission
    │       └─ Show validation errors
    │
    └─ FormGroup.invalid = false
        └─ Allow submission
            └─ Send to API
```

## Component Lifecycle

```
Admin/Customer Dashboard Component
    │
    ├─ constructor() ───────→ Dependency Injection
    │   └─ Create FormGroup
    │
    ├─ ngOnInit() ──────────→ Load initial data
    │   ├─ Check auth (if customer, check isCustomer())
    │   ├─ Load list data
    │   └─ Initialize forms
    │
    ├─ Template Updates ────→ Reactive to form changes
    │   ├─ User input
    │   ├─ Form validation
    │   └─ Error display
    │
    ├─ User Action ────────→ Method call
    │   ├─ onSubmit()
    │   ├─ delete()
    │   ├─ edit()
    │   └─ Service call
    │
    └─ ngOnDestroy() ───────→ Cleanup (if needed)
        └─ Unsubscribe from observables
```

---

This architecture ensures:
- ✅ Clear separation of concerns
- ✅ Reusable services
- ✅ Type-safe data flow
- ✅ Proper error handling
- ✅ Authentication & authorization
- ✅ Reactive UI updates
