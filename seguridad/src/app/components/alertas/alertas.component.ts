import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';
import { SupabaseService } from '../../services/supabase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.css'
})
export class AlertasComponent implements OnInit, OnDestroy {

  public allAlerts: any[] = [];

  // Public properties for data binding
  public displayedAlerts: any[] = [];
  public filterDesde: string = '';
  public filterHasta: string = '';
  public filterOrigen: string = 'Todos';
  public filterTipo: string = 'Todos';
  
  public isDeleteModalVisible: boolean = false;
  public alertToDelete: any = null;

  // Properties for status modification modal
  public isStatusModalVisible: boolean = false;
  public alertToModify: any = null;
  public selectedStatus: string = '';
  public statusOptions: string[] = ['Pendiente', 'En proceso', 'Completado', 'Cancelado', 'Suspendido'];

  // Properties for details modal
  public isDetailsModalVisible: boolean = false;
  public alertToShowDetails: any = null;

  // Theme property
  public currentTheme: 'light' | 'dark' = 'dark';
  
  // Logout Modal property
  public isLogoutModalVisible: boolean = false;

  // Language properties
  public uiText: any = {};
  private langSubscription!: Subscription;
  private themeSubscription!: Subscription;

  constructor(
    private router: Router, 
    private themeService: ThemeService,
    private translationService: TranslationService,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.fetchReports();
    this.themeSubscription = this.themeService.currentTheme.subscribe(theme => {
      this.currentTheme = theme;
    });
    this.langSubscription = this.translationService.uiText.subscribe(translations => {
      this.uiText = translations.alertas || {};
    });
  }

  async fetchReports() {
    const { data, error } = await this.supabaseService.client
      .from('reports')
      .select('*');

    if (error) {
      console.error('Error fetching reports:', error);
      // Handle error appropriately, maybe show a message to the user
    } else {
      this.allAlerts = data.map(report => ({ ...report, menuVisible: false }));
      this.aplicarFiltros();
    }
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
  
  // ... (rest of the component logic is unchanged)
  
  // --- Logout Modal Methods ---
  public showLogoutModal(): void {
    this.isLogoutModalVisible = true;
  }

  public hideLogoutModal(): void {
    this.isLogoutModalVisible = false;
  }
  
  public confirmLogout(): void {
      this.router.navigate(['/']);
  }

  // --- Actions Menu ---
  public toggleMenu(alerta: any): void {
    // Cierra cualquier otro menú que esté abierto
    this.displayedAlerts.forEach(a => {
      if (a !== alerta) {
        a.menuVisible = false;
      }
    });
    // Muestra u oculta el menú de la alerta seleccionada
    alerta.menuVisible = !alerta.menuVisible;
  }
  
  // Modified modificarEstado to use custom modal
  public modificarEstado(alerta: any): void {
    this.alertToModify = alerta;
    this.selectedStatus = alerta.estado; // Pre-select current status
    this.isStatusModalVisible = true;
    alerta.menuVisible = false; // Ocultar menú después de la acción
  }

  // New methods for status modification modal
  public showStatusModal(alerta: any): void {
    this.alertToModify = alerta;
    this.selectedStatus = alerta.estado;
    this.isStatusModalVisible = true;
  }

  public hideStatusModal(): void {
    this.isStatusModalVisible = false;
    this.alertToModify = null;
    this.selectedStatus = '';
  }

  public async confirmStatusChange(): Promise<void> {
    if (this.alertToModify && this.selectedStatus) {
      const { data, error } = await this.supabaseService.client
        .from('reports')
        .update({ estado: this.selectedStatus })
        .eq('id', this.alertToModify.id);

      if (error) {
        console.error('Error updating status:', error);
      } else {
        this.alertToModify.estado = this.selectedStatus;
        this.aplicarFiltros(); // Re-apply filters to update view if sorting/filtering is affected
      }
    }
    this.hideStatusModal();
  }

  // --- Details Modal ---
  public mostrarDetalles(alerta: any): void {
    this.alertToShowDetails = alerta;
    this.isDetailsModalVisible = true;
    alerta.menuVisible = false;
  }

  public hideDetailsModal(): void {
    this.isDetailsModalVisible = false;
    this.alertToShowDetails = null;
  }

  public eliminarAlerta(alerta: any): void {
    this.alertToDelete = alerta;
    this.isDeleteModalVisible = true;
    alerta.menuVisible = false;
  }

  public async confirmDelete(): Promise<void> {
    if (!this.alertToDelete) return;

    const { error } = await this.supabaseService.client
      .from('reports')
      .delete()
      .eq('id', this.alertToDelete.id);

    if (error) {
      console.error('Error deleting report:', error);
    } else {
      // Eliminar de la lista principal
      const indexAll = this.allAlerts.findIndex(a => a.id === this.alertToDelete.id);
      if (indexAll > -1) {
        this.allAlerts.splice(indexAll, 1);
      }
      
      // Volver a aplicar filtros para actualizar la vista
      this.aplicarFiltros();
    }
    
    this.hideDeleteModal();
  }

  public hideDeleteModal(): void {
    this.isDeleteModalVisible = false;
    this.alertToDelete = null;
  }
  
  // --- Filtering Logic ---
  public aplicarFiltros(): void {
    const hastaDate = this.filterHasta ? new Date(this.filterHasta) : null;
    if (hastaDate) {
      hastaDate.setHours(23, 59, 59, 999);
    }

    const filtered = this.allAlerts.filter(alerta => {
      const fechaAlerta = new Date(alerta.fechaHora);
      if (this.filterDesde && fechaAlerta < new Date(this.filterDesde)) return false;
      if (hastaDate && fechaAlerta > hastaDate) return false;
      if (this.filterOrigen !== 'Todos' && alerta.origen !== this.filterOrigen) return false;
      if (this.filterTipo !== 'Todos' && alerta.tipo !== this.filterTipo) return false;
      return true;
    });

    this.displayedAlerts = filtered.sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
  }

  public limpiarFiltros(): void {
    this.filterDesde = '';
    this.filterHasta = '';
    this.filterOrigen = 'Todos';
    this.filterTipo = 'Todos';
    this.aplicarFiltros();
  }

  // --- Chip Styling ---
  public getOriginChipClasses(origen: string): string {
    switch (origen) {
      case 'IA':
        return 'bg-purple-500/20 text-purple-400 font-medium py-1 px-3 rounded-full text-xs';
      case 'Guardia':
        return 'bg-blue-500/20 text-blue-400 font-medium py-1 px-3 rounded-full text-xs';
      default:
        return 'bg-gray-500/20 text-gray-400 font-medium py-1 px-3 rounded-full text-xs';
    }
  }

  public getStatusChipClasses(estado: string): string {
    const baseClasses = 'font-medium py-1 px-3 rounded-full text-xs';
    switch (estado) {
      case 'Pendiente':
        return `bg-yellow-500/20 text-yellow-400 ${baseClasses}`;
      case 'En proceso':
        return `bg-blue-500/20 text-blue-400 ${baseClasses}`;
      case 'Completado':
        return `bg-green-500/20 text-green-400 ${baseClasses}`;
      case 'Cancelado':
          return `bg-red-500/20 text-red-400 ${baseClasses}`;
      case 'Suspendido':
          return `bg-gray-500/20 text-gray-400 ${baseClasses}`;
      default:
        return `bg-gray-500/20 text-gray-400 ${baseClasses}`;
    }
  }
}