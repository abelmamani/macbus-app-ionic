import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { IonButton, IonButtons, IonCard, IonContent, IonHeader, IonIcon, IonLabel, IonList, IonTitle, IonToolbar, ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { send } from 'ionicons/icons';
import { Trip } from './models/trip.model';
import { TripUpdate } from './models/trip.update.model';
import { TripService } from './services/trip.service';

@Component({
  selector: 'app-trip',
  templateUrl: './trip.page.html',
  styleUrls: ['./trip.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonList, IonCard, IonLabel]
})
export class TripPage implements OnInit{
  @Input() busRouteName!: string;
  trips: Trip[] = [];
  tripUpdate!: TripUpdate | null;
  defaultLocation: [number, number] = [-29.176179, -67.4932864];
  constructor(private tripService: TripService, private modalController: ModalController, private toastController: ToastController,  private locationAccuracy: LocationAccuracy) {
    addIcons({send});
  }

  ngOnInit(): void {
    this.getTrips();
  }
  getTrips(){
    this.tripService.getTripsByRoute(this.busRouteName).subscribe({
      next: (res: Trip[]) => {
        this.trips = res;
      },
      error: (err) => {this.showToast(err.error.message ? err.error.message : "No se pudo obtener los viajes");}
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  async showToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'bottom',
    });
    await toast.present();
  }

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
      this.showToast("posicion");
    } catch (err) {
      this.showToast("No se pudo obtener su ubicacion.");
    }
  }

  private async getCurrentLocation(): Promise<[number, number] | null> {
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 10000
    };
    const position = await Geolocation.getCurrentPosition(options);
    if(position){
      return [position.coords.latitude, position.coords.longitude];
    }
    return this.defaultLocation;
  }

  private async enableGps(): Promise<void> {
    const canRequest = await this.locationAccuracy.canRequest();
    if (canRequest) {
      await this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
    }
  }

  private startLocationUpdates(): void {
    setInterval(async () => {
      try {
        const position = await this.getCurrentLocation();
        this.showToast("nuevo");
      } catch (error) {
        this.showToast('Error actualizando la ubicación');
      }
    }, 10000);
  }

  async startTrip(id: string){
    //const location: [number, number] | null = await this.getCurrentLocation();
    const location: [number, number] = this.defaultLocation;
    if(location){
      this.tripUpdate = {id: id, latitude: location[0], longitude: location[1], timestamp: 0, route: this.busRouteName};
      this.tripService.startTrip(this.tripUpdate).subscribe({
        next: (res: number) => {
          if(this.tripUpdate){
            this.tripUpdate.timestamp = res;
          }
        },
        error: (err) => {
          this.showToast(err.error.message ? err.error.message :"No se pudo iniciar el viaje");}
      });
    }else{
      this.showToast("Active su ubicacion para iniciar el viaje")
    }
  }
}
