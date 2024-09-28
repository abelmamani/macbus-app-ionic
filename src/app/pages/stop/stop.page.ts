import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { IonButton, IonContent, IonHeader, IonIcon, ModalController, NavController, ToastController } from '@ionic/angular/standalone';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import * as L from 'leaflet';
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

  constructor(private stopService: StopService, private locationAccuracy: LocationAccuracy, private navCtrl: NavController, private modalController: ModalController, private toastController: ToastController) {
    addIcons({arrowBackOutline});
  }

  async ionViewDidEnter() {
    await this.initMap();
  }

  goBack() {
    this.navCtrl.back();
  }

  private async getCurrentLocation(): Promise<[number, number]> {
    try {
      const permissionStatus = await Geolocation.checkPermissions();
      if (permissionStatus?.location !== 'granted') {
        const requestStatus = await Geolocation.requestPermissions();
        if (requestStatus.location !== 'granted') {
          await this.openSettings(true);
          this.showToast("No se pudo obtener su ubicacion");
          return this.defaultLocation;
        }
      }
  
      if (Capacitor.getPlatform() === 'android') {
        await this.enableGps();
      }
      let options: PositionOptions = {
        maximumAge: 3000,
        timeout: 10000,
        enableHighAccuracy: true
      };
      const position = await Geolocation.getCurrentPosition(options);
     
      return [position.coords.latitude, position.coords.longitude];
    } catch (e: any) {
      if (e?.message === 'Location services are not enabled') {
        await this.openSettings();
      }
      this.showToast("No se pudo obtener su ubicacion");
      return this.defaultLocation;
    }
  }

  private openSettings(app = false) {
    return NativeSettings.open({
      optionAndroid: app ? AndroidSettings.ApplicationDetails : AndroidSettings.Location,
      optionIOS: app ? IOSSettings.App : IOSSettings.LocationServices
    });
  }

  private async enableGps() {
    const canRequest = await this.locationAccuracy.canRequest();
    if (canRequest) {
      await this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
    }
  }

  private async initMap(): Promise<void> {
    if (this.mapContainer && this.mapContainer.nativeElement) {
      const location: [number, number] = await this.getCurrentLocation();
      this.map = L.map(this.mapContainer.nativeElement, {
        center: location,
        zoom: 15,
        zoomControl: false
      });
      //L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        //attribution: '© OpenStreetMap contributors'
      //}).addTo(this.map);
      L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=80b8814ea749431d94c7899f1454d687', {
        attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
      this.loadStops();
      this.addUserMarker(location);
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
    const modal = await this.modalController.create({
      component: StopTimeComponent,
      componentProps: {
        stopId: stopId,
        stopName: stopName
      },
      initialBreakpoint: 0.3, 
    breakpoints: [0.3, 0.5, 1], 
    backdropDismiss: true,
    });
    return await modal.present();
  }

  ionViewWillLeave() {
    if (this.map) {
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
