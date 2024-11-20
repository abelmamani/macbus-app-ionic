import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonDatetime, IonDatetimeButton, IonHeader, IonIcon, IonList, IonModal, IonSpinner, IonTitle, IonToolbar, ModalController, ToastController} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { busOutline, calendarOutline, closeOutline, location, openOutline, timeOutline } from 'ionicons/icons';
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
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonList, IonIcon, IonModal, IonDatetime, IonSpinner, IonDatetimeButton]
})
export class StopTimeComponent  implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  @Input() stopId!: string;
  @Input() stopName!: string;
  @Input() isMap: boolean = false;
  stopTimes: StopTime[] = [];
  selectedDate: string | null = null;
  today: string = new Date().toISOString().split('T')[0]; 
  isLoading: boolean = true;
  constructor(private stopService: StopService, private stopHistoryService: StopHistoryService, private tripService: TripService, private modalController: ModalController, private toastController: ToastController) {}

  ngOnInit() {
    addIcons({timeOutline, location, busOutline, openOutline, closeOutline, calendarOutline});
    this.getStopTimes();
  }

  closeModal() {
    this.modalController.dismiss();
  }

  getStopTimes() {
    this.isLoading = true;
    this.stopService.getStopTimes(this.stopName).subscribe({
      next: (res: StopTime[]) => {
        this.stopTimes = res;
        this.stopHistoryService.addStop(this.stopId, this.stopName);
        this.isLoading = false;
      },
      error: (error) => {
        this.showToast("Hubo problema al obtener los arribos de hoy");
      this.isLoading = false;
      }
    });
  }

  getStopTimesByDate(date: string){
    this.isLoading = true;
    this.stopService.getStopTimesBydate(this.stopName, date).subscribe({
      next: (res: StopTime[]) => {
        this.stopTimes = res;
        this.stopHistoryService.addStop(this.stopId, this.stopName);
        this.isLoading = false;
      },
      error: (error) => {
        this.stopTimes = [];
        this.showToast(error.error.message ? error.error.message : "Hubo problema al obtener los arribos para "+this.selectedDate);
        this.isLoading = false;
      }
    });
  }

  onDateChange(event: any) {
    this.modal.dismiss();
    this.selectedDate = new Date(event.detail.value).toISOString().split('T')[0]; 
    this.getStopTimesByDate(this.selectedDate);
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
