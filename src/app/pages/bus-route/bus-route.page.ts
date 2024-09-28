import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonAvatar, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar, ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, busOutline, searchOutline } from 'ionicons/icons';
import { BusRouteDetailPage } from '../bus-route-detail/bus-route-detail.page';
import { BusRoute } from './models/bus.route.model';
import { BusRouteService } from './services/bus-route.service';
@Component({
  selector: 'app-bus-route',
  templateUrl: './bus-route.page.html',
  styleUrls: ['./bus-route.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonContent, IonButton, IonIcon, IonButton, IonToolbar, IonTitle, IonButtons, IonList, IonItem, IonAvatar, IonBackButton, IonLabel]
})
    
export class BusRoutePage implements OnInit{
  busRoutes: BusRoute[] = [];
  constructor(private busRouteService: BusRouteService, private modalController: ModalController, private toastController: ToastController) {
    addIcons({arrowBackOutline, busOutline, searchOutline});
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

  async showToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'bottom',
    });
    await toast.present();
  }
}
