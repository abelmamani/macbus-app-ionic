import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { IonAvatar, IonBackButton, IonButton, IonButtons, IonCard, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar, ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, busOutline, searchOutline, timeOutline } from 'ionicons/icons';
import { Identity } from 'src/app/models/identity.model';
import { AuthService } from 'src/app/services/auth.service';
import { BusRouteDetailPage } from './components/bus-route-detail/bus-route-detail.page';
import { BusRoute } from './models/bus.route.model';
import { BusRouteService } from './services/bus-route.service';
import { TripPage } from './components/trip/trip.page';
@Component({
  selector: 'app-bus-route',
  templateUrl: './bus-route.page.html',
  styleUrls: ['./bus-route.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonContent, IonButton, IonIcon, IonButton, IonToolbar, IonTitle, IonButtons, IonList, IonItem, IonAvatar, IonBackButton, IonLabel, IonCard]
})
    
export class BusRoutePage implements OnInit{
  busRoutes: BusRoute[] = [];
  identity = signal<Identity | null>(null);
  constructor(private busRouteService: BusRouteService, private authService: AuthService, private modalController: ModalController, private toastController: ToastController) {
    addIcons({arrowBackOutline, busOutline, searchOutline, timeOutline});
    this.authService.getIdentitySubject().subscribe((identity: Identity | null) => {
      this.identity.set(identity ? identity : null);
    });
  }
  ngOnInit(): void {
    this.getBusRoutes();
  }
  getBusRoutes(){
    this.busRouteService.getBusRoutes().subscribe({
      next: (res: BusRoute[]) => {
        this.busRoutes = res;
      },
      error: (err) => {this.showToast("No se pudo obtener las lineas");}
    });
  }

  async openBusRouteMap(busRouteName: string) {
    const modal = await this.modalController.create({
      component: BusRouteDetailPage,
      componentProps: {
        busRouteName: busRouteName
      }
    });
    return await modal.present();
  }

  async getTrips(busRouteName: string) {
    const modal = await this.modalController.create({
      component: TripPage,
      componentProps: {
        busRouteName: busRouteName
      },
      initialBreakpoint: 0.5, 
      breakpoints: [0.5, 1], 
      backdropDismiss: true,
    });
    return await modal.present();
  }

  async showToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'bottom',
    });
    await toast.present();
  }
}
