import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.css'
})
export class AlertasComponent implements OnInit, OnDestroy {

  private readonly allAlerts: any[] = [
    { 
      fechaHora: "2025-11-21T14:30", origen: "IA", tipo: "Movimiento detectado", sitioArea: "Perímetro Oeste", estado: "Pendiente", menuVisible: false,
      detalles: {
        descripcion: "Se detectó una figura humana corriendo cerca de la valla perimetral.",
        camara: { numero: 4, ip: "192.168.1.104", id: "CAM-PER-04" }
      }
    },
    { 
      fechaHora: "2025-11-21T12:05", origen: "Guardia", tipo: "Botón de pánico", sitioArea: "Planta Norte – Entrada", estado: "En proceso", menuVisible: false,
      detalles: {
        nombreGuardia: "Carlos Ramirez", idGuardia: "78901234",
        descripcion: "Se activó el botón de pánico debido a un intento de acceso forzado en la puerta principal."
      }
    },
    { 
      fechaHora: "2025-11-20T23:00", origen: "IA", tipo: "Intrusión", sitioArea: "Bodega B - Acceso Principal", estado: "Completado", menuVisible: false,
      detalles: {
        descripcion: "Múltiples sensores de movimiento activados en secuencia. Se detectaron dos individuos.",
        camara: { numero: 2, ip: "192.168.1.102", id: "CAM-BOD-02" }
      }
    },
    { 
      fechaHora: "2025-11-20T18:45", origen: "IA", tipo: "Cámara desconectada", sitioArea: "Torre 3 - Nivel 2", estado: "Cancelado", menuVisible: false,
      detalles: {
        descripcion: "La cámara CAM-T3-N2 ha perdido la conexión. Última imagen recibida a las 18:44.",
        camara: { numero: 3, ip: "192.168.1.103", id: "CAM-T3-N2" }
      }
    },
    { 
      fechaHora: "2025-11-19T16:10", origen: "Guardia", tipo: "Acceso no autorizado", sitioArea: "Laboratorio Central", estado: "Completado", menuVisible: false,
      detalles: {
        nombreGuardia: "Ana Torres", idGuardia: "12345678",
        descripcion: "Una persona sin la acreditación adecuada intentó acceder al laboratorio. Se le denegó el paso y se le escoltó fuera de las instalaciones."
      }
    }
  ];

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
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.aplicarFiltros();
    this.themeSubscription = this.themeService.currentTheme.subscribe(theme => {
      this.currentTheme = theme;
    });
    this.langSubscription = this.translationService.uiText.subscribe(translations => {
      this.uiText = translations.alertas || {};
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

  public confirmStatusChange(): void {
    if (this.alertToModify && this.selectedStatus) {
      this.alertToModify.estado = this.selectedStatus;
      this.aplicarFiltros(); // Re-apply filters to update view if sorting/filtering is affected
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

  public confirmDelete(): void {
    if (!this.alertToDelete) return;

    // Eliminar de la lista principal
    const indexAll = this.allAlerts.findIndex(a => a === this.alertToDelete);
    if (indexAll > -1) {
      this.allAlerts.splice(indexAll, 1);
    }
    
    // Volver a aplicar filtros para actualizar la vista
    this.aplicarFiltros();
    
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