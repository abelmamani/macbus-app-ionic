import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Trip } from '../models/trip.model';
import { TripUpdate } from '../models/trip.update.model';

@Injectable({
  providedIn: 'root'
})

export class TripService {
  private apiUrl = "macbus-api-rest-sigma.vercel.app/api/trips";
  //private apiUrl = "http://localhost:3000/api/trips";
  constructor(private http: HttpClient) {}
  
  getTripsByRoute(route: string):Observable<Trip[]>{
    return this.http.get<Trip[]>(`${this.apiUrl}/${route}`);
  }
  getTripUpdate(id: string):Observable<TripUpdate>{
    return this.http.get<TripUpdate>(`${this.apiUrl}/trip_update/${id}`);
  }
  startTrip(tripUpdate: TripUpdate):Observable<number>{
    return this.http.post<number>(`${this.apiUrl}/trip_update/start`, tripUpdate);
  }
  updatetTripUpdate(tripUpdate: TripUpdate):Observable<number>{
    return this.http.put<number>(`${this.apiUrl}/trip_update/update`, tripUpdate);
  }
  finishTripUpdate(id: string):Observable<any>{
    return this.http.delete(`${this.apiUrl}/trip_update/${id}`);
  }
}
