import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { IonButton, IonButtons, IonCard, IonContent, IonHeader, IonIcon, IonLabel, IonList, IonTitle, IonToolbar, ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { send } from 'ionicons/icons';
import { LocationService } from 'src/app/services/location.service';
import { TripUpdateService } from 'src/app/services/trip.update.service';
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
  tripUpdate!: TripUpdate;
  defaultLocation: [number, number] = [-29.176179, -67.4932864];
  constructor(private tripService: TripService, private tripUpdateService: TripUpdateService, private locationService: LocationService, private modalController: ModalController, private toastController: ToastController,  private locationAccuracy: LocationAccuracy) {
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

  async startTrip(id: string){
    const location: [number, number] | null = await this.locationService.getCurrentLocation();
    if(location){
      this.tripUpdate = {id: id, latitude: location[0], longitude: location[1], timestamp: 0, route: this.busRouteName};
      this.tripService.startTrip(this.tripUpdate).subscribe({
        next: (res: number) => {
          this.tripUpdate.timestamp = res;
          this.tripUpdateService.saveTripUpdate(this.tripUpdate);
          this.showToast("Viaje iniciado correctamente");
          this.modalController.dismiss({tripUpdate: this.tripUpdate});
        },
        error: (err) => {
          this.showToast(err.error.message ? err.error.message :"No se pudo iniciar el viaje");}
      });
    }else{
      this.showToast("Active su ubicacion para iniciar el viaje")
    }
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
}
