// home.page.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { busOutline, locationOutline } from 'ionicons/icons';
import { PublicRoute } from 'src/app/models/routes.model';
import { NavOption } from './models/nav.option.model';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink],
})
export class HomePage {
  navOptions: NavOption[] = [
    {title: 'Paradas', icon: 'location-outline', url: PublicRoute.BUS_STOPS},
    {title: 'Lineas', icon: 'bus-outline', url: PublicRoute.BUS_ROUTES},
  ];
  recentSearches = [
    { name: 'Terminal de Nonogasta', time: 'hace 1 min' },
    { name: 'Terminal de Chilecito', time: 'hace 2 horas' },
    { name: 'Undec', time: 'hace 1 día' },
    { name: 'Terminal de Nonogasta', time: 'hace 1 min' },
    { name: 'Terminal de Chilecito', time: 'hace 2 horas' },
    { name: 'Undec', time: 'hace 1 día' },
    { name: 'Terminal de Nonogasta', time: 'hace 1 min' },
    { name: 'Terminal de Chilecito', time: 'hace 2 horas' },
    { name: 'Undec', time: 'hace 1 día' },
    { name: 'Terminal de Nonogasta', time: 'hace 1 min' },
    { name: 'Terminal de Chilecito', time: 'hace 2 horas' },
    { name: 'Undec', time: 'hace 1 día' },
    { name: 'Terminal de Nonogasta', time: 'hace 1 min' },
    { name: 'Terminal de Chilecito', time: 'hace 2 horas' },
    { name: 'Undec', time: 'hace 1 día' },
  ];

  constructor() {
    addIcons({locationOutline, busOutline});
  }
}