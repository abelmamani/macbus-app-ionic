import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonCardTitle, IonContent, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonList, IonTitle, IonToolbar, ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { busOutline, closeOutline, location, openOutline, timeOutline } from 'ionicons/icons';
import { TripUpdate } from 'src/app/pages/bus-route/components/trip/models/trip.update.model';
import { TripService } from 'src/app/pages/bus-route/components/trip/services/trip.service';
import { StopHistoryService } from 'src/app/services/stop.history.service';
import { StopTime } from '../../models/StopTime.model';
import { StopService } from '../../services/stop.service';
@Component({
  selector: 'app-stop-time',
  templateUrl: './stop-time.component.html',
  styleUrls: ['./stop-time.component.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonImg, IonLabel, IonAvatar, IonList, IonItem, IonCard, IonCardContent, IonCardTitle, IonIcon]
})
export class StopTimeComponent  implements OnInit {
 
  @Input() stopId!: string;
  @Input() stopName!: string;
  stopTimes: StopTime[] = [];
  constructor(private stopService: StopService, private stopHistoryService: StopHistoryService, private tripService: TripService, private modalController: ModalController, private toastController: ToastController) { }

  ngOnInit() {
    addIcons({timeOutline, location, busOutline, openOutline, closeOutline});
    this.getStopTimes();
  }

  closeModal() {
    this.modalController.dismiss();
  }

  getStopTimes() {
    this.stopService.getStopTimes(this.stopName).subscribe({
      next: (res: StopTime[]) => {
        this.stopTimes = res;
        this.stopHistoryService.addStop(this.stopId, this.stopName);
      },
      error: (error) => {
        this.showToast("Hubo problema al obtener los arribos");
      }
    });
  }

  getTripUpdate(id: string) {
    this.tripService.getTripUpdate(id).subscribe({
      next: (res: TripUpdate) => {
        this.modalController.dismiss({tripUpdate: res})
        this.closeModal(); 
      },
      error: (err) => {
        this.showToast(err.error.message ? err.error.message : "No se puede obtener la ubicación, inténtelo más tarde!");
      }
    });
  }

  formatArrivalTime(arrivalTime: string): string {
    //const now = toZonedTime(new Date(), 'America/Argentina/Buenos_Aires');
    const now = new Date();
    const [hours, minutes] = arrivalTime.split(':').map(Number);
    const arrivalDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    const timeDifferenceInMinutes = Math.floor((arrivalDateTime.getTime() - now.getTime()) / (1000 * 60));
  
    if (timeDifferenceInMinutes < 0) {
      return arrivalTime; 
    } else if (timeDifferenceInMinutes === 0) {
      return 'YA'; 
    } else if (timeDifferenceInMinutes < 60) {
      // Si queda menos de 60 minutos
      return `${timeDifferenceInMinutes} min`;
    } else {
      return arrivalTime; 
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
