import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, ModalController, ToastController } from '@ionic/angular/standalone';
import * as L from 'leaflet';
import { Shape } from '../bus-route/models/shape.model';
import { StopSequence } from '../bus-route/models/stop.sequence.model';
import { BusRouteService } from '../bus-route/services/bus-route.service';

@Component({
  selector: 'app-bus-route-detail',
  templateUrl: './bus-route-detail.page.html',
  styleUrls: ['./bus-route-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton]
})
export class BusRouteDetailPage {
  @Input() busRouteName!: string;
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;
  private map!: L.Map | null;
  private shapes: Shape[] = [];
  private stopSequences: StopSequence[] = [];
  private markerStopSequences: Map<string, L.CircleMarker> = new Map();
  private defaultLocation: [number, number] = [-29.300575, -67.504712];
  private userMarker!: L.CircleMarker;
  private pulseEffect: any;

  constructor(private busRoutervice: BusRouteService, private modalController: ModalController, private toastController: ToastController,  private locationAccuracy: LocationAccuracy) { }

  async ionViewDidEnter() {
    await this.initMap();
    await this.checkPermissionsAndGetLocation();
    this.startLocationUpdates();
  }

  private async initMap(): Promise<void> {
    if (this.mapContainer && this.mapContainer.nativeElement) {
      this.map = L.map(this.mapContainer.nativeElement, {
        center: this.defaultLocation,
        zoom: 12,
        zoomControl: false
      });
      //L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        //attribution: '© OpenStreetMap contributors'
      //}).addTo(this.map);
      L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=80b8814ea749431d94c7899f1454d687', {
        attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
      this.loadShape();
      this.loadStops();
    }
  }

  private loadShape(): void {
    this.busRoutervice.getShapesByRoute(this.busRouteName).subscribe({
      next: (res: Shape[]) => {
        this.shapes = res;
        this.addShapeToMap();
      },
      error: (error) => {
        this.showToast("No se puedo obtener la forma de recorrido.");
      }   
    });
  }

  private loadStops(): void {
    this.busRoutervice.getStopSequencesByRoute(this.busRouteName).subscribe({
      next: (res: StopSequence[]) => {
        this.stopSequences = res;
        this.addStopsToMap();
      },
      error: (error) => {
        this.showToast("No se puedo obtener la secuencia de paradas.");
      }   
    });
  }

  private addShapeToMap(): void {
    if (this.map && this.shapes.length > 0) {
      const latLngs: L.LatLngExpression[] = this.shapes.map(shape => [shape.latitude, shape.longitude] as L.LatLngExpression);
      const polyline: L.Polyline = L.polyline(latLngs, {  color: 'blue'}).addTo(this.map);
      this.map.fitBounds(polyline.getBounds());
    }
  }
  private addStopsToMap(): void {
    if (this.map) {
      this.stopSequences.forEach((ss, index) => {
        const timeoutId = setTimeout(() => {
          if (!this.map) {
            clearTimeout(timeoutId);
            return;
          }
          const stopId: string = ss.stop.id;
          if (!this.markerStopSequences.has(stopId)) {
            const marker = L.circleMarker([ss.stop.latitude, ss.stop.longitude], {
              radius: 8,
              color: "blue",
              fillColor: "white",
              fillOpacity: 0.7,
              weight: 2
            }).addTo(this.map).bindPopup(`<b>${ss.stop.name}</b>`);
            marker.openPopup();
            this.markerStopSequences.set(stopId, marker);
          } else {
            const existingMarker = this.markerStopSequences.get(stopId);
            if (existingMarker) {
              existingMarker.openPopup();
            }
          }
        }, index * 1000); 
      });
    }
  }
  

  closeModal() {
    this.modalController.dismiss();
  }

  ionViewWillLeave() {
    if (this.map) {
      this.map.remove();
      this.map = null;
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
  //NUEVO
  private async checkPermissionsAndGetLocation(): Promise<void> {
    try {
      const permissionStatus = await Geolocation.checkPermissions();
      if (permissionStatus?.location !== 'granted') {
        const requestStatus = await Geolocation.requestPermissions();
        if (requestStatus.location !== 'granted') {
          return;
        }
      }

      if (Capacitor.getPlatform() === 'android') {
        await this.enableGps();
      }

      const position = await this.getCurrentLocation();
      this.updateUserMarker(position);
    } catch (error) {
      this.showToast("No se pudo obtener su ubicacion.");
    }
  }

  private async getCurrentLocation(): Promise<[number, number]> {
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 10000
    };
    const position = await Geolocation.getCurrentPosition(options);
    return [position.coords.latitude, position.coords.longitude];
  }

  private async enableGps(): Promise<void> {
    const canRequest = await this.locationAccuracy.canRequest();
    if (canRequest) {
      await this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
    }
  }

  private updateUserMarker([latitude, longitude]: [number, number]): void {
    if (!this.map) return;
    if (this.userMarker) {
      this.userMarker.setLatLng([latitude, longitude]);
    } else {
      this.userMarker = L.circleMarker([latitude, longitude], {
        radius: 8,
        color: "white",
        fillColor: "black",
        fillOpacity: 0.7,
        weight: 2
      }).addTo(this.map).bindPopup('Mi ubicación actual');
      this.startPulseEffect();
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
  private startLocationUpdates(): void {
    setInterval(async () => {
      try {
        const position = await this.getCurrentLocation();
        this.updateUserMarker(position);
      } catch (error) {
        this.showToast('Error actualizando la ubicación');
      }
    }, 10000);
  }
}
