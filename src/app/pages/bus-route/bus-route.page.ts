import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
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
  imports: [CommonModule,IonicModule]})
    
export class BusRoutePage implements OnInit{
  busRoutes: BusRoute[] = [];
  constructor(private busRouteService: BusRouteService, private modalController: ModalController) {
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
      error: (err) => {console.log(err);}
    });
  }

  async openBusRouteMap(busRouteName: string) {
    const modal = await this.modalController.create({
      component: BusRouteDetailPage,
      componentProps: {
        busRouteName: busRouteName
      },
      initialBreakpoint: 1,
      breakpoints: [0, 1],
    });
    return await modal.present();
  }
}
