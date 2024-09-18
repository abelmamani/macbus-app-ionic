import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
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
  private map!: L.Map;
  private shapes: Shape[] = [];
  private stopSequences: StopSequence[] = [];
  private markerStopSequences: Map<string, L.CircleMarker> = new Map();
  private defaultLocation: [number, number] = [-29.300575, -67.504712];

  constructor(private busRoutervice: BusRouteService, private modalController: ModalController) { }

  async ionViewDidEnter() {
    await this.initMap();
  }

  private async initMap(): Promise<void> {
    if (this.mapContainer && this.mapContainer.nativeElement) {
      this.map = L.map(this.mapContainer.nativeElement, {
        center: this.defaultLocation,
        zoom: 12,
        zoomControl: false
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
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
        console.error('Error loading shapes', error);
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
        console.error('Error loading stop sequences', error);
      }   
    });
  }

  private addShapeToMap(): void {
    if (this.map && this.shapes.length > 0) {
      const latLngs: L.LatLngExpression[] = this.shapes.map(shape => [shape.latitude, shape.longitude] as L.LatLngExpression);
      const polyline: L.Polyline = L.polyline(latLngs).addTo(this.map);
      this.map.fitBounds(polyline.getBounds());
    }
  }
  private addStopsToMap(): void {
    if (this.map) {
      this.stopSequences.forEach((ss, index) => {
        setTimeout(() => {
          const stopId: string = ss.stop.id;
          if (!this.markerStopSequences.has(stopId)) {
            const marker = L.circleMarker([ss.stop.latitude, ss.stop.longitude], {
              radius: 10,
              color: '#000000',
              fillColor: 'blue',
              fillOpacity: 0.6,
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
    }
  }
}
