import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
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
  loginAttempts = 3;
  isLocked = false;
  countdown = 60;
  private timer: any;

  public uiText: any = {};
  private langSubscription!: Subscription;

  constructor(
    private router: Router,
    private translationService: TranslationService,
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
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  login() {
    if (this.isLocked) {
      return;
    }

    let storedPassword = 'cisco123'; // Default password
    if (isPlatformBrowser(this.platformId)) {
      const savedPassword = localStorage.getItem('adminPassword');
      if (savedPassword) {
        storedPassword = savedPassword;
      }
    }

    if (this.email === 'diego123@gmail.com' && this.password === storedPassword) {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('adminEmail', this.email);
        const loginTime = new Date().toISOString();
        localStorage.setItem('lastLoginDate', loginTime);
      }
      this.router.navigate(['/home']);
    } else {
      this.loginAttempts--;
      this.errorMessage = this.uiText.deniedMessage;
      if (this.loginAttempts === 0) {
        this.isLocked = true;
        this.errorMessage = this.uiText.lockedMessage;
        this.startTimer();
      }
    }
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.timer);
        this.isLocked = false;
        this.loginAttempts = 3;
        this.countdown = 60;
        this.errorMessage = '';
      }
    }, 1000);
  }
}
