import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AlertasComponent } from './components/alertas/alertas.component';
import { RegistrosComponent } from './components/registros/registros.component';
import { AdminProfileComponent } from './components/admin-profile/admin-profile.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'alertas', component: AlertasComponent },
    { path: 'registros', component: RegistrosComponent },
    { path: 'admin-profile', component: AdminProfileComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
