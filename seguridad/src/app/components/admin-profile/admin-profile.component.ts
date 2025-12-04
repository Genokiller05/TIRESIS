import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css']
})
export class AdminProfileComponent implements OnInit, OnDestroy {

  // State management properties
  public isEditingProfile: boolean = false;
  public isChangingPassword: boolean = false;

  // Form data models
  public adminName: string = 'Administrator Name';
  public adminPhone: string = '+1 (555) 123-4567';
  public profileImageUrl: string = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQmWUv9sstTOZeCdKbqAGq4-uBgDkOTEF0cDZJNbvJ_j_lXk18EZLWH7xcFdqcb0ragF6cJdZD2pQuN2RUHqKLGXJEADyujxtP9UGnYVcmZNYi-UlT9KNYYEjhei64yx9RytYpTHNSbt_-XcAoqmyS0LcJzsNb3_fFph10xLsDaE2jw7C5FjHnTwVs71Hjv6Vm66jUWKq4f3C4Z7a-uafFkpjAKfyUhgYmpQfoiQLSo4ASQkUmaWtDW3JtKZUU9u_JRzfUAUvMk7ah';
  public adminEmail: string = '';
  public lastLoginDate: string | null = null;

  // Password change models
  public newPassword: string = '';
  public confirmPassword: string = '';
  public passwordErrorMessage: string = '';
  public isSuccessModalVisible: boolean = false;

  // Language properties
  public selectedLanguage: string = 'Español';
  public uiText: any = {};
  private langSubscription!: Subscription;

  // Theme property
  public currentTheme: 'light' | 'dark' = 'dark';
  private themeSubscription!: Subscription;

  constructor(
    private router: Router, 
    private themeService: ThemeService,
    public translationService: TranslationService, // Make it public
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService.currentTheme.subscribe(theme => {
      this.currentTheme = theme;
    });
    this.loadProfile();

    this.langSubscription = this.translationService.uiText.subscribe(translations => {
      this.uiText = translations.adminProfile || {};
    });
    this.selectedLanguage = this.translationService.currentLanguage.value;
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  private loadProfile(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedProfile = localStorage.getItem('adminProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        this.adminName = profile.name || this.adminName;
        this.adminPhone = profile.phone || this.adminPhone;
        this.profileImageUrl = profile.imageUrl || this.profileImageUrl;
      }
      
      this.adminEmail = localStorage.getItem('adminEmail') || '';
      this.lastLoginDate = localStorage.getItem('lastLoginDate');
    }
  }

  private saveProfile(): void {
    if (isPlatformBrowser(this.platformId)) {
      const profile = {
        name: this.adminName,
        phone: this.adminPhone,
        imageUrl: this.profileImageUrl
      };
      localStorage.setItem('adminProfile', JSON.stringify(profile));
    }
  }

  public setLanguage(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value;
    this.translationService.setLanguage(lang);
  }

  // --- Theme Methods ---
  public setTheme(theme: 'light' | 'dark'): void {
    this.themeService.setTheme(theme);
  }

  public navigateTo(event: Event, path: string): void {
    event.preventDefault();
    this.router.navigate([path]);
  }

  // --- Profile Editing Methods ---
  public toggleEditProfile(): void {
    if (this.isEditingProfile) {
      this.saveProfile();
    }
    this.isEditingProfile = !this.isEditingProfile;
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImageUrl = e.target?.result as string;
        // Save immediately after image selection
        this.saveProfile();
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  // --- Password Change Methods ---
  public showChangePassword(): void {
    this.isChangingPassword = true;
  }

  public cancelChangePassword(): void {
    this.isChangingPassword = false;
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordErrorMessage = '';
  }

  public confirmChangePassword(): void {
    // 1. Check if passwords match
    if (this.newPassword !== this.confirmPassword) {
      this.passwordErrorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    // 2. Validate password complexity (letters and numbers only)
    const validPasswordRegex = /^[a-zA-Z0-9]+$/;
    if (!validPasswordRegex.test(this.newPassword)) {
      this.passwordErrorMessage = 'La contraseña solo puede contener letras y números.';
      return;
    }

    // 3. Save the new password to localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('adminPassword', this.newPassword);
    }
    
    // 4. Reset and hide the form, then show success
    this.cancelChangePassword();
    this.showSuccessModal();
  }

  // --- Success Modal Methods ---
  public showSuccessModal(): void {
    this.isSuccessModalVisible = true;
  }

  public hideSuccessModal(): void {
    this.isSuccessModalVisible = false;
  }
}

