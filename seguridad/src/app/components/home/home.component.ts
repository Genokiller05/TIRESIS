// Force re-compile
import { Component, PLATFORM_ID, Inject, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {

      public searchId: string = '';
      public errorMessage: string = '';
      public successMessage: string = '';
      public currentGuard: any = null; // Store the entire guard object
      public isLogoutModalVisible: boolean = false;
      public isDeleteModalVisible: boolean = false;
    
      private currentGuardId: string | null = null;
    
      // Theme property
      public currentTheme: 'light' | 'dark' = 'dark';

      // Language properties
      public uiText: any = {};
      private langSubscription!: Subscription;
      private themeSubscription!: Subscription;
    
      constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private router: Router,
        private themeService: ThemeService,
        private translationService: TranslationService
      ) {}
    
      ngOnInit(): void {
        this.themeSubscription = this.themeService.currentTheme.subscribe(theme => {
          this.currentTheme = theme;
        });
        this.langSubscription = this.translationService.uiText.subscribe(translations => {
          this.uiText = translations.home || {};
        });
      }

      ngOnDestroy(): void {
        if (this.langSubscription) {
          this.langSubscription.unsubscribe();
        }
        if (this.themeSubscription) {
          this.themeSubscription.unsubscribe();
        }
      }
    
      // --- Theme Methods ---
      public setTheme(theme: 'light' | 'dark'): void {
        this.themeService.setTheme(theme);
      }

      public navigateTo(event: Event, path: string): void {
        event.preventDefault();
        this.router.navigate([path]);
      }
    
      // --- Search and Data Methods ---
      public async onSearch(): Promise<void> {
        this.currentGuard = null;
        this.errorMessage = '';
        this.successMessage = '';

        const searchId = this.searchId.trim();
    
        if (!searchId) {
          this.errorMessage = 'Por favor, ingrese un ID de guardia.';
          return;
        }
    
        try {
          const response = await fetch(`http://localhost:3000/api/guards/${searchId}`);
    
          if (!response.ok) {
            if (response.status === 404) {
              this.errorMessage = `No se encontró ningún guardia con el ID ${searchId}.`;
            } else {
              const errorData = await response.json().catch(() => null); // Catch potential JSON parsing errors
              this.errorMessage = `Error del servidor: ${errorData?.message || response.statusText}`;
            }
            throw new Error(this.errorMessage);
          }
    
          const guard = await response.json();
          
          if (guard && guard.idEmpleado) {
            this.currentGuard = guard;
            this.currentGuardId = guard.idEmpleado; // Set the current guard ID
            this.successMessage = 'Guardia encontrado!';
          } else {
            this.errorMessage = 'El formato de la respuesta del guardia no es válido.';
          }
    
        } catch (error: any) {
          console.error('Error en la búsqueda:', error);
          if (!this.errorMessage) { // Avoid overwriting a more specific error message
            this.errorMessage = `Ocurrió un error al buscar al guardia.`;
          }
        } finally {
        }
      }

      public clearSearch(): void {
        this.searchId = '';
        this.errorMessage = '';
        this.successMessage = '';
        this.resetGuardState();
      }
    
      public async onGuardFileSelected(event: any): Promise<void> {
        const file = event.target.files?.[0];
        if (!file || !this.currentGuardId) {
          this.errorMessage = 'Por favor, primero busque un guardia y luego seleccione un archivo.';
          return;
        }

        this.successMessage = '';
        this.errorMessage = 'Subiendo imagen...';

        // Step 1: Upload the file to the dedicated upload endpoint
        const uploadFormData = new FormData();
        uploadFormData.append('photo', file);

        try {
          const uploadResponse = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Fallo al subir la imagen.');
          }

          const uploadResult = await uploadResponse.json();
          const newPhotoPath = uploadResult.filePath;
          
          this.errorMessage = 'Imagen subida, actualizando perfil...';

          // Step 2: Update the guard with the new photo path
          const updateResponse = await fetch(`http://localhost:3000/api/guards/${this.currentGuardId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ foto: newPhotoPath }),
          });

          if (!updateResponse.ok) {
            throw new Error('No se pudo actualizar el perfil del guardia con la nueva foto.');
          }

          this.currentGuard = await updateResponse.json();
          this.successMessage = 'Foto de perfil actualizada permanentemente.';
          this.errorMessage = '';

        } catch (error: any) {
          this.errorMessage = error.message;
          console.error('Error al actualizar la foto:', error);
        }
      }

      public getGuardImageUrl(): string {
          if (this.currentGuard && this.currentGuard.foto) {
              // Check if the photo URL is already absolute
              if (this.currentGuard.foto.startsWith('http')) {
                return this.currentGuard.foto;
              }
              // Handle relative URLs from the server
              return `http://localhost:3000${this.currentGuard.foto.startsWith('/') ? '' : '/'}${this.currentGuard.foto}`;
          }
          return 'https://via.placeholder.com/150'; // Fallback image
      }
    
      // --- Delete Methods ---
      public deleteGuard(): void {
        if (!this.currentGuardId) {
          // Although the button should be disabled, this is a safeguard
          this.errorMessage = 'Por favor, busque y seleccione un guardia primero.';
          setTimeout(() => this.errorMessage = '', 3000);
          return;
        }
        this.showDeleteModal();
      }
    
      public async confirmDelete(): Promise<void> {
        if (!this.currentGuardId) return;
    
        try {
          const response = await fetch(`http://localhost:3000/api/guards/${this.currentGuardId}`, {
            method: 'DELETE',
          });
    
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al eliminar el guardia.');
          }
    
          this.successMessage = 'Guardia eliminado correctamente.';
          this.clearSearch(); // Use clearSearch to reset the view
          setTimeout(() => this.successMessage = '', 3000);
    
        } catch (error: any) {
          console.error('Error al eliminar guardia:', error);
          this.errorMessage = error.message;
        } finally {
          this.hideDeleteModal();
        }
      }  
  
    // --- Modal Methods ---
    public showLogoutModal(): void {
      this.isLogoutModalVisible = true;
    }
  
    public hideLogoutModal(): void {
      this.isLogoutModalVisible = false;
    }
    
    public confirmLogout(): void {
        this.router.navigate(['/']);
    }
  
    public showDeleteModal(): void {
      this.isDeleteModalVisible = true;
    }
  
    public hideDeleteModal(): void {
      this.isDeleteModalVisible = false;
    }
  
    // --- Private Helper ---
    private renderNotFound(): void {
      this.resetGuardState();
      this.errorMessage = 'No se encontró ningún guardia con ese ID.';
    }
  
    private resetGuardState(): void {
      this.currentGuard = null;
      this.currentGuardId = null;
    }
  }
  