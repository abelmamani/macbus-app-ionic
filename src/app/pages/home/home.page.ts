// home.page.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MenuController, ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { busOutline, locationOutline, openOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { PublicRoute } from 'src/app/models/routes.model';
import { StopHistory } from 'src/app/models/stop.history.model';
import { LocationService } from 'src/app/services/location.service';
import { StopHistoryService } from 'src/app/services/stop.history.service';
import { getTimeAgo } from 'src/app/utils/time.utils';
import { StopTimeComponent } from '../stop/components/stop-time/stop-time.component';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HomePage  implements OnInit{
  private defaultLocation: [number, number] = [-29.162033, -67.496040];
  recentStops$!: Observable<StopHistory[]>;
  constructor(private stopHistoryService: StopHistoryService, private locationService: LocationService, private toastController: ToastController, private menuController: MenuController, private modalController: ModalController, private router: Router) {
    addIcons({locationOutline, busOutline, openOutline});
  }

  ngOnInit(): void {
    this.recentStops$ = this.stopHistoryService.history$;
  }

  openMenu(){
    this.menuController.open();
  }

  async getStops(){
    const location: [number, number] | null = await this.locationService.getCurrentLocation();
    if(location){
    this.router.navigate([PublicRoute.BUS_STOPS]);
    }else{
      this.showToast("Active su ubicacion.");
    }
  }

  getRoutes(){
    this.router.navigate([PublicRoute.BUS_ROUTES]);
  }

  async getStopTimes(stopId: string, stopName: string) {
    const modal = await this.modalController.create({
      component: StopTimeComponent,
      componentProps: {
        stopId: stopId,
        stopName: stopName,
        isMap: false
      },
      initialBreakpoint: 0.3, 
    breakpoints: [0.3, 0.5, 1], 
    backdropDismiss: true,
    });
    
    return await modal.present();
  }

  getTimeAgo(timestamp: number): string {
    return getTimeAgo(timestamp);
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