import { Routes } from '@angular/router';
import { PublicRoute } from './models/routes.model';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: PublicRoute.BUS_ROUTES,
    loadComponent: () => import('./pages/bus-route/bus-route.page').then( m => m.BusRoutePage)
  },
  {
    path: PublicRoute.BUS_STOPS,
    loadComponent: () => import('./pages/stop/stop.page').then( m => m.StopPage)
  },
  {
    path: 'bus-route-detail',
    loadComponent: () => import('./pages/bus-route-detail/bus-route-detail.page').then( m => m.BusRouteDetailPage)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  }
];
