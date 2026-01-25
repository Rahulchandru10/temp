import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin/dashboard/admin-dashboard.component';
import { CustomerDashboardComponent } from './pages/customer/customer-dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './core/auth/auth.guard';
import { RoleGuard } from './core/auth/role.guard';

import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  },

  {
    path: 'customer/dashboard',
    component: CustomerDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'CUSTOMER' }
  },

  { path: '**', redirectTo: '/login' }
];
