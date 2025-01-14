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
import { Shape } from '../bus-route/models/shape.model';
import { BusRouteService } from '../bus-route/services/bus-route.service';
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
  private shapes: Shape[] = [];
  private currentPolyline : L.Polyline | null = null;
  private userMarker: L.CircleMarker | null = null;
  private pulseEffect:  ReturnType<typeof setInterval> | null = null;
  private locationUpdateInterval:  ReturnType<typeof setInterval> | null = null;
  private defauultLocation: [number, number] = [-29.162033, -67.496040];
  private userLocation: [number, number] | null = null;
  tripUpdate!: TripUpdate | null;
  updateSubscription!: Subscription | null;
  private busMarker!: L.Marker | null;

  constructor(private stopService: StopService, private busRouteService: BusRouteService, private tripService: TripService, private locationService: LocationService, private navCtrl: NavController, private modalController: ModalController, private toastController: ToastController) {
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
      if(location){
        this.userLocation = location;
      }
      this.map = L.map(this.mapContainer.nativeElement, {
        center: location ? location : this.defauultLocation,
        zoom: 15,
        zoomControl: false
      });
      /*
       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);
    */
      L.tileLayer('https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=78ebc0ed1b2b42319546eea384f783ce', {
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
    this.startUpdatingUserMarker();
  }

  private startUpdatingUserMarker(): void {
    this.locationUpdateInterval = setInterval(() => {
      if (this.tripUpdate) {
        this.removeUserMarker(); 
      } else {
        this.updateUserLocation();
      }
    }, 5000);
  }
  
  private async updateUserLocation(): Promise<void> {
    const newLocation: [number, number] | null = await this.locationService.getCurrentLocation();
      if (newLocation) {
        if (newLocation !== this.userLocation) {
          this.userLocation = newLocation;
          if (this.userMarker) {
            this.userMarker.setLatLng(newLocation); 
          }
        }
      }
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

  private removeUserMarker(): void {

    if (this.userMarker) {
      if (this.map) {
        this.map.removeLayer(this.userMarker);
      }
      this.userMarker = null; 
    }
  
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }

    if (this.pulseEffect) {
      clearInterval(this.pulseEffect);
      this.pulseEffect = null;
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
        }).addTo(this.map).on('click', () => {
          this.getStopTimes(stop.id, stop.name)
        }).bindPopup(`<b>${stop.name}</b>`);
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
      initialBreakpoint: 0.5, 
    breakpoints: [0.5, 1], 
    backdropDismiss: true,
    });
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.tripUpdate = result.data.tripUpdate;
        this.updateBusMarker(this.tripUpdate!);
        this.loadShape(result.data.route, result.data.distanceTraveled);
        this.startTracking();
      }
    });
    return await modal.present();
  }

  private loadShape(route: string, distanceTraveled: number): void {
    this.busRouteService.getShapesByRouteAndDistance(route, distanceTraveled).subscribe({
      next: (res: Shape[]) => {
        this.shapes = res;
        this.addShapeToMap();
      },
      error: (error) => {
        this.showToast("No se puedo obtener la forma de recorrido.");
      }   
    });
  }

    private addShapeToMap(): void {
      if (this.map && this.shapes.length > 0) {
        const latLngs: L.LatLngExpression[] = this.shapes.map(shape => [shape.latitude, shape.longitude] as L.LatLngExpression);
        const polyline: L.Polyline = L.polyline(latLngs, {
          color: 'black',    
          weight: 2,         
          opacity: 0.7,       
          dashArray: '10, 10'  
        }).addTo(this.map);
        this.currentPolyline = polyline;
        //this.map.fitBounds(polyline.getBounds());
      }
    }


  startTracking() {
    if (this.tripUpdate) {
      this.updateSubscription = interval(15000).subscribe(() => {
        this.getBusLocation();
      });
    }
  }

  getBusLocation() {
    if (this.tripUpdate) {
      this.tripService.getTripUpdate(this.tripUpdate.id).subscribe({
        next: (res: TripUpdate) => {
          this.tripUpdate = res;
          this.updateBusMarker(res);
        },
        error: (err) => {
          this.stopTripUpdate();
          this.showToast(err.error.message ? err.error.message : "Error al obtener la ubicación del colectivo, inténtelo más tarde!");
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
    if(this.userLocation){
      this.addUserMarker(this.userLocation);
    }
    if (this.currentPolyline) {
      this.map?.removeLayer(this.currentPolyline);
      this.currentPolyline = null;
    }
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
    this.removeUserMarker();
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
