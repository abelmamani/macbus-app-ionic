import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonButton, IonContent, IonHeader, IonIcon, ModalController, NavController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import * as L from 'leaflet';
import { interval, Subscription } from 'rxjs';
import { LocationService } from 'src/app/services/location.service';
import { getTimeAgo } from 'src/app/utils/time.utils';
import { TripUpdate } from '../bus-route/components/trip/models/trip.update.model';
import { TripService } from '../bus-route/components/trip/services/trip.service';
import { StopTimeComponent } from './components/stop-time/stop-time.component';
import { Stop } from './models/stop.model';
import { StopService } from './services/stop.service';
@Component({
  selector: 'app-stop',
  templateUrl: './stop.page.html',
  styleUrls: ['./stop.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonContent, IonButton, IonIcon],
})
export class StopPage{
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;
  private map!: L.Map;
  private stops: Stop[] = [];
  private userMarker: L.CircleMarker | null = null;
  private pulseEffect: any;
  private defaultLocation: [number, number] = [-29.162033, -67.496040];
  tripUpdate!: TripUpdate | null;
  updateSubscription!: Subscription | null;
  private busMarker!: L.Marker | null;

  constructor(private stopService: StopService, private tripService: TripService, private locationService: LocationService, private navCtrl: NavController, private modalController: ModalController, private toastController: ToastController) {
    addIcons({arrowBackOutline});
  }

  async ionViewDidEnter() {
    await this.initMap();
  }

  goBack() {
    this.navCtrl.back();
  }

  private async initMap(): Promise<void> {
    if (this.mapContainer && this.mapContainer.nativeElement) {
      const location: [number, number] | null = await this.locationService.getCurrentLocation();
      this.map = L.map(this.mapContainer.nativeElement, {
        center: location ? location : this.defaultLocation,
        zoom: 15,
        zoomControl: false
      });
      /*
       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);
      */
      L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=80b8814ea749431d94c7899f1454d687', {
        attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
     
      this.loadStops();
      if(location){
        this.addUserMarker(location);
      }
    }
  }
  
  private addUserMarker(location: [number, number]): void {
    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
    }

    this.userMarker = L.circleMarker(location, {
      radius: 8,
      color: "white",
      fillColor: "black",
      fillOpacity: 0.7,
      weight: 2
    }).addTo(this.map);

    this.startPulseEffect();
  }

  private startPulseEffect(): void {
    if (this.userMarker) {
      let growing = true;
      let size = 8;

      this.pulseEffect = setInterval(() => {
        if (growing) {
          size += 0.5;
          if (size >= 12) growing = false;
        } else {
          size -= 0.5;
          if (size <= 8) growing = true;
        }

        this.userMarker?.setRadius(size);
      }, 75);
    }
  }

  private loadStops(): void {
    this.stopService.getStops().subscribe(
      (stops: Stop[]) => {
        this.stops = stops;
        this.addStopsToMap();
      },
      (error) => {
        this.showToast("Ocurrio un problema al obtener las paradas");
      }
    );
  }

  private addStopsToMap(): void {
    if (this.map) {
      this.stops.forEach(stop => {
        L.circleMarker([stop.latitude, stop.longitude], {
          radius: 8,
          color: "black",
          fillColor: "white",
          fillOpacity: 0.7,
          weight: 2
        }).addTo(this.map).on('click', () => {this.getStopTimes(stop.id, stop.name)});
      });
    }
  }

  async getStopTimes(stopId: string, stopName: string) {
    if(this.tripUpdate){
      return;
    }
    const modal = await this.modalController.create({
      component: StopTimeComponent,
      componentProps: {
        stopId: stopId,
        stopName: stopName,
        isMap: true
      },
      initialBreakpoint: 0.3, 
    breakpoints: [0.3, 0.5, 1], 
    backdropDismiss: true,
    });
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.TripUpdateHandle(result.data.tripUpdate);
      }
    });
    return await modal.present();
  }

  TripUpdateHandle(tripUpdate: TripUpdate){
    this.tripUpdate = tripUpdate;
    this.startTripUpdate();
  }

  startTripUpdate() {
    if (this.tripUpdate) {
      this.updateSubscription = interval(15000).subscribe(() => {
        this.getTripUpdate();
      });
      this.getTripUpdate();
    }
  }

  getTripUpdate() {
    if (this.tripUpdate) {
      this.tripService.getTripUpdate(this.tripUpdate.id).subscribe({
        next: (res: TripUpdate) => {
          this.tripUpdate = res;
          this.updateBusMarker(res);
        },
        error: (err) => {
          this.stopTripUpdate();
          this.showToast(err.error.message ? err.error.message : "No se puede obtener la ubicación, inténtelo más tarde!");
        }
      });
    }
  }
  stopTripUpdate() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe(); 
      this.updateSubscription = null;
    }
    this.tripUpdate = null; 
    this.removeBusMarker(); 
  }

  updateBusMarker(tripUpdate: TripUpdate) {
    if (this.busMarker) {
      this.busMarker.setLatLng([tripUpdate.latitude, tripUpdate.longitude]);
      this.busMarker.setPopupContent(`${tripUpdate.route} - ${getTimeAgo(tripUpdate.timestamp)}`);
    } else {
      const busIcon = L.icon({
        iconUrl: 'assets/img/front-of-bus.png', 
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30], 
      });
      this.busMarker = L.marker([tripUpdate.latitude, tripUpdate.longitude], {
        icon: busIcon,
      }).bindPopup(tripUpdate.route + " - " + getTimeAgo(tripUpdate.timestamp)).addTo(this.map);
    }
  }
  

  removeBusMarker() {
    if (this.busMarker) {
      this.map.removeLayer(this.busMarker); 
      this.busMarker = null; 
    }
  }

  ionViewWillLeave() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe(); 
      this.updateSubscription = null;
    }
    if (this.map) {
      this.removeBusMarker(); 
      this.map.remove();
    }
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
