import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonButton, IonButtons, IonChip, IonContent, IonDatetime, IonHeader, IonIcon, IonList, IonModal, IonSpinner, IonTitle, IonToolbar, ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { busOutline, closeOutline, locationOutline, openOutline, timeOutline } from 'ionicons/icons';
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
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonList, IonIcon, IonModal, IonDatetime, IonSpinner, IonChip, IonButtons, IonDatetime]
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
    addIcons({timeOutline, locationOutline, busOutline, openOutline, closeOutline});
    this.getStopTimes();
  }

  closeModal() {
    this.modalController.dismiss();
  }

  closeDateTime() {
    this.modal.dismiss();
  }


  getStopTimes() {
    this.isLoading = true;
    this.stopService.getStopTimes(this.stopName).subscribe({
      next: (res: StopTime[]) => {
        this.stopTimes = res;
        this.stopHistoryService.addStop(this.stopId, this.stopName);
        this.isLoading = false;
        this.selectedDate = null;
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
    const selectedDate = new Date(event.detail.value);
    const today = new Date();
    
    if (selectedDate.getTime() > today.getTime()) {
      this.modal.dismiss();
      this.selectedDate = selectedDate.toISOString().split('T')[0];
      this.getStopTimesByDate(this.selectedDate);
    } else {
      this.showToast('Por favor selecciona una fecha posterior a hoy.');
    }
  }
  

  getTripUpdate(id: string, route: string,  distanceTraveled: Number) {
    this.tripService.getTripUpdate(id).subscribe({
      next: (res: TripUpdate) => {
        this.modalController.dismiss({tripUpdate: res, route: route, distanceTraveled: distanceTraveled})
        this.closeModal(); 
      },
      error: (err) => {
        this.showToast(err.error.message ? err.error.message : "Error al obtener la ubicación del colectivo, inténtelo más tarde!");
      }
    });
  }

  showDate(date: string): string {
    const parsedDate = new Date(date + 'T00:00:00'); // Asegura que sea solo la fecha sin la hora
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short', // Día de la semana abreviado
      month: 'short',   // Mes abreviado
      day: 'numeric',   // Día del mes
      year: 'numeric'   // Año
    };
    return parsedDate.toLocaleDateString('es-ES', options);
  }

  formatArrivalTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (hours > 23) {
      const adjustedHours = hours % 24;
      const formattedHours = adjustedHours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      return `${formattedHours}:${formattedMinutes}`;
    }
    return timeString;
  }

  formatArrivalTimeAsString(arrivalTime: string): string {
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
