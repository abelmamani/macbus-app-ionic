import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { NavController } from '@ionic/angular';
import { IonButton, IonContent, IonHeader, IonIcon } from '@ionic/angular/standalone';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import * as L from 'leaflet';
import { Stop } from './models/stop.model';
import { StopService } from './services/stop.service';

@Component({
  selector: 'app-stop',
  templateUrl: './stop.page.html',
  styleUrls: ['./stop.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonContent, IonButton, IonIcon]
})
export class StopPage{
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;
  private map!: L.Map;
  private stops: Stop[] = [];
  busStopIcon = L.icon({
    iconUrl: 'assets/img/placeholder.png',
    iconAnchor: [16, 32],
  });

  private defaultLocation: [number, number] = [-29.300575, -67.504712];

  constructor(private stopService: StopService, private locationAccuracy: LocationAccuracy, private navCtrl: NavController) {
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
      console.log('Permission status: ', permissionStatus.location);
      if (permissionStatus?.location !== 'granted') {
        const requestStatus = await Geolocation.requestPermissions();
        if (requestStatus.location !== 'granted') {
          await this.openSettings(true);
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
      console.log(e);
      return this.defaultLocation;
    }
  }

  private openSettings(app = false) {
    console.log('Abriendo configuración...');
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
      const location = await this.getCurrentLocation();
      this.map = L.map(this.mapContainer.nativeElement, {
        center: location,
        zoom: 15,
        zoomControl: false
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);
      this.loadStops();
    }
  }

  private loadStops(): void {
    this.stopService.getStops().subscribe(
      (stops: Stop[]) => {
        this.stops = stops;
        this.addStopsToMap();
      },
      (error) => {
        console.error('Error loading stops', error);
      }
    );
  }

  private addStopsToMap(): void {
    if (this.map) {
      this.stops.forEach(stop => {
        const marker = L.marker([stop.latitude, stop.longitude], { icon: this.busStopIcon })
          .addTo(this.map)
          .bindPopup(`<b>${stop.name}</b>`);
      });
    }
  }

  ionViewWillLeave() {
    if (this.map) {
      this.map.remove();
    }
  }
}
