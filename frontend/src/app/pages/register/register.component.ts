import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
    registerForm: FormGroup;
    loading = false;
    error = '';
    success = '';

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, { validator: this.passwordMatchValidator });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password')?.value === g.get('confirmPassword')?.value
            ? null : { 'mismatch': true };
    }

    onSubmit() {
        if (this.registerForm.invalid) return;

        this.loading = true;
        this.error = '';
        this.success = '';

        const registerData = this.registerForm.value;

        this.auth.register(registerData).subscribe({
            next: () => {
                this.success = 'Registration successful! Redirecting to login...';
                setTimeout(() => this.router.navigate(['/login']), 2000);
            },
            error: (err) => {
                this.error = err.error?.message || 'Registration failed. Username might already exist.';
                this.loading = false;
            }
        });
    }
}
