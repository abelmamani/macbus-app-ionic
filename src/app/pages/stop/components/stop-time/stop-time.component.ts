import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonCardTitle, IonContent, IonHeader, IonImg, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { StopTime } from '../../models/StopTime.model';
import { StopService } from '../../services/stop.service';
@Component({
  selector: 'app-stop-time',
  templateUrl: './stop-time.component.html',
  styleUrls: ['./stop-time.component.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonImg, IonLabel, IonAvatar, IonList, IonItem, IonCard, IonCardContent, IonCardTitle]
})
export class StopTimeComponent  implements OnInit {
  @Input() stopName!: string;
  stopTimes: StopTime[] = [];
  constructor(private stopService: StopService, private modalController: ModalController) { }

  ngOnInit() {
    this.getStopTimes();
  }

  closeModal() {
    this.modalController.dismiss();
  }

  getStopTimes() {
    this.stopService.getStopTimes(this.stopName).subscribe({
      next: (res: StopTime[]) => {
        this.stopTimes = res;
        console.log(res);
      },
      error: (error) => {
        console.error('Error loading stop times', error);
      }
    });
  }
}
