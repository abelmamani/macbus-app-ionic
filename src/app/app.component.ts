import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonMenu, IonMenuToggle, IonRouterOutlet, IonSplitPane, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { busOutline, homeOutline, locationOutline, logInOutline, logOutOutline, menuOutline, personCircleOutline } from 'ionicons/icons';
import { Identity } from './models/identity.model';
import { MenuItem } from './models/menu.item.model';
import { PublicRoute } from './models/routes.model';
import { AuthService } from './services/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonHeader, IonToolbar, IonTitle, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet],
})
export class AppComponent {
  menuItems = signal<MenuItem[]>([
    {icon: 'home-outline', label: 'Principal', route: PublicRoute.HOME},
    {icon: 'location-outline', label: 'Paradas', route: PublicRoute.BUS_STOPS},
    {icon: 'bus-outline', label: 'Lineas', route: PublicRoute.BUS_ROUTES},
  ]);
  identity = signal<Identity | null>(null);
  constructor(private authService: AuthService, private router: Router) {
    addIcons({menuOutline, homeOutline, locationOutline, busOutline, logOutOutline, logInOutline, personCircleOutline});
    this.authService.getIdentitySubject().subscribe((identity: Identity | null) => {
      this.identity.set(identity ? identity : null);
    });
  }
  login(){
    this.router.navigate([PublicRoute.LOGIN]);
  }
  logout(){
    this.authService.logout();
  }

}
