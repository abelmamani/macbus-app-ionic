import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Stop } from '../models/stop.model';
import { StopTime } from '../models/StopTime.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class StopService {
  private apiUrl = environment.apiUrl + '/stops';

  constructor(private http: HttpClient) {}
  getStops(): Observable<Stop[]> {
    return this.http.get<Stop[]>(this.apiUrl);
  }

  getStopTimes(name: string): Observable<StopTime[]> {
    return this.http.get<StopTime[]>(`${this.apiUrl}/stop_times/${name}`);
  }
  getStopTimesBydate(name: string, date: string): Observable<StopTime[]> {
    return this.http.get<StopTime[]>(
      `${this.apiUrl}/stop_times/${name}/${date}`
    );
  }
}
