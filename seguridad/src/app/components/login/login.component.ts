import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { SupabaseService } from '../../services/supabase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  email = '';
  password = '';
  errorMessage = '';
  isLocked = false;
  countdown = 0;

  public uiText: any = {};
  private langSubscription!: Subscription;

  constructor(
    private router: Router,
    private translationService: TranslationService,
    private supabaseService: SupabaseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.langSubscription = this.translationService.uiText.subscribe(translations => {
      this.uiText = translations.login || {};
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  async login() {
    // Acceso manual para el administrador solicitado
    if (this.email === 'admin12345@tiresis.mx' && this.password === 'cisco123') {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('adminEmail', this.email);
      }

      // Intentar autenticación real en segundo plano para obtener token de sesión (necesario para RLS)
      try {
        const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
          email: this.email,
          password: this.password,
        });

        if (error) {
          // Si falla (probablemente usuario no existe), intentamos registrarlo para obtener sesión
          console.log('Login falló, intentando registro automático...', error.message);
          const { data: signUpData, error: signUpError } = await this.supabaseService.client.auth.signUp({
            email: this.email,
            password: this.password,
          });
          
          if (signUpError) {
             console.error('Error en auto-registro:', signUpError.message);
          } else {
             console.log('Usuario registrado y logueado automáticamente.');
          }
        }
      } catch (e) {
        console.error('Error intentando obtener sesión de Supabase:', e);
      }

      this.router.navigate(['/home']);
      return;
    }

    try {
      const { error } = await this.supabaseService.client.auth.signInWithPassword({
        email: this.email,
        password: this.password,
      });

      if (error) {
        this.errorMessage = error.message;
      } else {
        this.router.navigate(['/home']);
      }
    } catch (error) {
      this.errorMessage = 'An unexpected error occurred.';
    }
  }
}
