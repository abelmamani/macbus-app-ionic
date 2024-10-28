import { CommonModule } from '@angular/common';
import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { IonAvatar, IonBackButton, IonButton, IonButtons, IonCard, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonTitle, IonToolbar, ModalController, NavController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, busOutline, locationOutline, openOutline, refreshOutline, stopCircleOutline, timeOutline } from 'ionicons/icons';
import * as L from 'leaflet';
import { Identity } from 'src/app/models/identity.model';
import { AuthService } from 'src/app/services/auth.service';
import { TripUpdateService } from 'src/app/services/trip.update.service';
import { getTimeAgo } from 'src/app/utils/time.utils';
import { Stop } from '../stop/models/stop.model';
import { TripUpdate } from './components/trip/models/trip.update.model';
import { TripService } from './components/trip/services/trip.service';
import { TripPage } from './components/trip/trip.page';
import { BusRoute } from './models/bus.route.model';
import { Shape } from './models/shape.model';
import { StopSequence } from './models/stop.sequence.model';
import { BusRouteService } from './services/bus-route.service';

@Component({
  selector: 'app-bus-route',
  templateUrl: './bus-route.page.html',
  styleUrls: ['./bus-route.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonContent, IonButton, IonIcon, IonButton, IonToolbar, IonTitle, IonButtons, IonList, IonItem, IonAvatar, IonBackButton, IonLabel, IonCard, IonListHeader]
})
    
export class BusRoutePage{
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;
  private map: L.Map | null = null;
  private markerStopSequences: Map<string, L.CircleMarker> = new Map();
  busRoutes: BusRoute[] = [];
  currentBusRoute: BusRoute | null = null;
  selectedItem: boolean = false;
  private shapes: Shape[] = [];
  private currentPolyline : L.Polyline | null = null;
  private busMarker!: L.Marker | null;
  stopSequences: StopSequence[] = [];
  identity = signal<Identity | null>(null);
  tripUpdate!: TripUpdate | null;
  locationInterval: any;
  isRestartEnabled = false;
  isFinishEnabled = false;
  private defaultLocation: [number, number] = [-29.300575, -67.504712];

  constructor(private busRouteService: BusRouteService, private authService: AuthService, private tripUpdateService: TripUpdateService, private tripServcie: TripService, private modalController: ModalController, private toastController: ToastController, private navCtrl: NavController) {
    addIcons({arrowBackOutline, busOutline, openOutline, timeOutline, locationOutline, refreshOutline, stopCircleOutline});
    this.authService.getIdentitySubject().subscribe((identity: Identity | null) => {
      this.identity.set(identity ? identity : null);
    });
  }

  async ionViewDidEnter() {
    await this.initMap();
    this.checkStoredTripUpdate();
  }

  private async initMap(): Promise<void> {
    if (this.mapContainer && this.mapContainer.nativeElement) {
      this.map = L.map(this.mapContainer.nativeElement, {
        center: this.defaultLocation,
        zoom: 12,
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
    this.getBusRoutes();
    }
  }
  getBusRoutes(){
    this.busRouteService.getBusRoutes().subscribe({
      next: (res: BusRoute[]) => {
        this.busRoutes = res;
      },
      error: () => { this.showToast("No se pudo obtener las líneas"); }
    });
  }

  private loadShape(): void {
    if(this.currentBusRoute){
      this.busRouteService.getShapesByRoute(this.currentBusRoute.longName).subscribe({
        next: (res: Shape[]) => {
          this.shapes = res;
          this.addShapeToMap();
        },
        error: (error) => {
          this.showToast("No se puedo obtener la forma de recorrido.");
        }   
      });
    }
  }

  private loadStops(): void {
    if(this.currentBusRoute){
      this.busRouteService.getStopSequencesByRoute(this.currentBusRoute.longName).subscribe({
        next: (res: StopSequence[]) => {
          this.stopSequences = res;
          this.addStopsToMap();
        },
        error: (error) => {
          this.showToast("No se puedo obtener la secuencia de paradas.");
        }   
      });
    }
  }

  private addShapeToMap(): void {
    if (this.map && this.shapes.length > 0 && this.currentBusRoute) {
      const latLngs: L.LatLngExpression[] = this.shapes.map(shape => [shape.latitude, shape.longitude] as L.LatLngExpression);
      const polyline: L.Polyline = L.polyline(latLngs, {  color: this.currentBusRoute.color}).addTo(this.map);
      this.currentPolyline = polyline;
      this.map.fitBounds(polyline.getBounds());
    }
  }
  private addStopsToMap(): void {
    if (this.map) {
      this.stopSequences.forEach((ss, index) => {
        const stopId: string = ss.stop.id;
        if (!this.markerStopSequences.has(stopId) && this.map && this.currentBusRoute) {
          const marker = L.circleMarker([ss.stop.latitude, ss.stop.longitude], {
            radius: 8,
            color: this.currentBusRoute.color,
            fillColor: "white",
            fillOpacity: 0.7,
            weight: 2
          }).addTo(this.map).bindPopup(`<b>${ss.stop.name}</b>`);
          this.markerStopSequences.set(stopId, marker);
        } 
      });
    }
  }

  async viewDetails(route: BusRoute) {
    this.selectedItem = true;
    this.currentBusRoute = route;
    this.clearPreviousRoute();
    this.loadShape();
    this.loadStops();
  }

  async getTrips(busRoute: BusRoute) {
    const modal = await this.modalController.create({
      component: TripPage,
      componentProps: {
        busRouteName: busRoute.longName
      },
      initialBreakpoint: 0.5, 
      breakpoints: [0.5, 1], 
      backdropDismiss: true,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.tripUpdate = result.data.tripUpdate;
        this.viewDetails(busRoute);
        this.isFinishEnabled = true;
        this.updateBusMarker(this.tripUpdate!);
        this.startLocationUpdates();
      }
    });
    return await modal.present();
  }

  private clearPreviousRoute(): void {
    if (this.currentPolyline) {
      this.map?.removeLayer(this.currentPolyline);
      this.currentPolyline = null;
    }
    this.markerStopSequences.forEach(marker => {
      this.map?.removeLayer(marker);
    });
    this.markerStopSequences.clear();
  }

  searchStop(stop: Stop) {
    if (this.map) {
      const marker: L.CircleMarker | undefined = this.markerStopSequences.get(stop.id);
      if (marker) {
        this.map.setView([stop.latitude, stop.longitude], 14);
        marker.openPopup();  
      }
    }
  }

  checkStoredTripUpdate() {
    const tripUpdate = this.tripUpdateService.getTripUpdate();
    if (tripUpdate) {
      this.updateBusMarker(tripUpdate);
      this.tripUpdate = tripUpdate;
      this.isFinishEnabled = true;
      const timeElapsed = Date.now() -tripUpdate.timestamp;
      if (timeElapsed < 300000) {
        this.isRestartEnabled = true; 
      }
    }
  }

  startLocationUpdates() {
    if (!this.locationInterval) {
      this.locationInterval = setInterval(async () => {
        const location = await this.defaultLocation; 
        if (location) {
          this.tripUpdate!.latitude = location[0];
          this.tripUpdate!.longitude = location[1];
          this.tripServcie.updatetTripUpdate(this.tripUpdate!).subscribe({
            next: (res: number) => {
              this.tripUpdate!.timestamp = res;
              this.updateBusMarker(this.tripUpdate!);
              this.tripUpdateService.saveTripUpdate(this.tripUpdate!);
              this.isRestartEnabled = false; 
            },
            error: (err) => {
              this.isRestartEnabled = true;
              clearInterval(this.locationInterval);
              this.locationInterval = null; 
              console.log(err)
              this.showToast("Error al enviar la ubicación.")
            }
          });
        } else {
          this.isRestartEnabled = true;
          clearInterval(this.locationInterval);
          this.locationInterval = null; 
        }
      }, 15000); 
    }
}

  finishTrip() {
    if(this.tripUpdate){
      this.tripServcie.finishTripUpdate(this.tripUpdate?.id).subscribe({
        next: () => {
          this.goBackBusRoutes();
          clearInterval(this.locationInterval);
          this.tripUpdateService.removeTripUpdate();
          this.tripUpdate = null;
          this.isFinishEnabled = false;
          this.isRestartEnabled = false;
          this.removeBusMarker();
          this.showToast("Viaje finalizado.");
        },
        error: (err) => {
          this.showToast("Hubo un problema al finalizar el viaje!");
        }
      }); 
    }
  }

  restartTrip() {
    this.isRestartEnabled = false;
    this.startLocationUpdates(); 
    this.showToast("Envío de ubicación reiniciado.");
  }

  updateBusMarker(tripUpdate: TripUpdate) {
    if(this.map){
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
  }

  removeBusMarker() {
    if (this.map && this.busMarker) {
      this.map.removeLayer(this.busMarker); 
      this.busMarker = null; 
    }
  }

  getTimeAgo(timestamp: number): string{
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
  
  ionViewWillLeave() {
    if (this.map) {
      this.map.remove();
    }
  }

  goBackBusRoutes(){
    this.selectedItem = false;
    this.clearPreviousRoute();
  }
  
  goBack() {
    this.navCtrl.back();
  }
}
