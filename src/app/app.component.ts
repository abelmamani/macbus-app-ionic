import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonMenu, IonMenuToggle, IonNote, IonRouterOutlet, IonSplitPane } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bus, card, home, location, logIn, logOut, menuOutline, personCircleOutline } from 'ionicons/icons';
import { Identity } from './models/identity.model';
import { MenuItem } from './models/menu.item.model';
import { PublicRoute } from './models/routes.model';
import { AuthService } from './services/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet],
})
export class AppComponent {
  menuItems = signal<MenuItem[]>([
    {icon: 'home', label: 'Principal', route: PublicRoute.HOME},
    {icon: 'location', label: 'Paradas', route: PublicRoute.BUS_STOPS},
    {icon: 'bus', label: 'Horarios', route: PublicRoute.BUS_ROUTES},
  ]);
  identity = signal<Identity | null>(null);
  constructor(private authService: AuthService, private router: Router) {
    addIcons({menuOutline, home, location, bus, card, logOut, logIn, personCircleOutline});
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
