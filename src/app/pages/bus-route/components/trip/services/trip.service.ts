import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Trip } from '../models/trip.model';
import { TripUpdate } from '../models/trip.update.model';

@Injectable({
  providedIn: 'root'
})

export class TripService {
  //private apiUrl = "https://macbus-api-rest.vercel.app/api/routes";
  private apiUrl = "http://localhost:3000/api/trips";
  constructor(private http: HttpClient) {}
  
  getTripsByRoute(route: string):Observable<Trip[]>{
    return this.http.get<[]>(`${this.apiUrl}/${route}`);
  }
  startTrip(tripUpdate: TripUpdate):Observable<number>{
    return this.http.post<number>(`${this.apiUrl}/start_trip`, tripUpdate);
  }
}
