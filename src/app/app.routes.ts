import { Routes } from '@angular/router';
import { PublicRoute } from './models/routes.model';

export const routes: Routes = [
  {path: '', redirectTo: PublicRoute.HOME, pathMatch: 'full'},
  {
    path: PublicRoute.HOME,
    loadComponent: () => import('./pages/home/home.page').then( m => m.HomePage),
  },
  {
    path: PublicRoute.LOGIN,
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: PublicRoute.BUS_ROUTES,
    loadComponent: () => import('./pages/bus-route/bus-route.page').then( m => m.BusRoutePage)
  },
  {
    path: PublicRoute.BUS_STOPS,
    loadComponent: () => import('./pages/stop/stop.page').then( m => m.StopPage)
  },
];
