import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TripUpdate } from '../pages/bus-route/components/trip/models/trip.update.model';

@Injectable({
  providedIn: 'root'
})
export class TripUpdateService {
  private readonly localStorageKey = 'tripUpdate';
  private tripUpdateSubject: BehaviorSubject<TripUpdate | null> = new BehaviorSubject<TripUpdate | null>(this.getTripUpdate());
  public tripUpdate$ = this.tripUpdateSubject.asObservable();

  getTripUpdate(): TripUpdate | null{
    const tripUpdate = localStorage.getItem(this.localStorageKey);
    return tripUpdate ? JSON.parse(tripUpdate) : null;
  }
  
  saveTripUpdate(tripUpdate: TripUpdate): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(tripUpdate));
    this.tripUpdateSubject.next(tripUpdate);
  }

  removeTripUpdate(): void {
    this.clearTripUpdate();
  }

  private clearTripUpdate(): void {
    localStorage.removeItem(this.localStorageKey);
    this.tripUpdateSubject.next(null);
  }
}
