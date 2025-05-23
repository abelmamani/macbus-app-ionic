import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BusRoute } from '../models/bus.route.model';
import { Shape } from '../models/shape.model';
import { StopSequence } from '../models/stop.sequence.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class BusRouteService {
  private apiUrl = environment.apiUrl + '/routes';

  constructor(private http: HttpClient) {}
  getBusRoutes(): Observable<BusRoute[]> {
    return this.http.get<BusRoute[]>(this.apiUrl);
  }
  getShapesByRoute(name: string): Observable<Shape[]> {
    return this.http
      .get<Shape[]>(`${this.apiUrl}/shapes/${name}`)
      .pipe(map((shapes) => shapes.sort((a, b) => a.sequence - b.sequence)));
  }

  getShapesByRouteAndDistance(
    name: string,
    distance: number
  ): Observable<Shape[]> {
    return this.http
      .get<Shape[]>(`${this.apiUrl}/shapes/distance/${name}/${distance}`)
      .pipe(map((shapes) => shapes.sort((a, b) => a.sequence - b.sequence)));
  }

  getStopSequencesByRoute(name: string): Observable<StopSequence[]> {
    return this.http
      .get<StopSequence[]>(this.apiUrl + '/stop_sequences/' + name)
      .pipe(
        map((stops) => {
          return stops.sort((a, b) => a.distanceTraveled - b.distanceTraveled);
        })
      );
  }
}
