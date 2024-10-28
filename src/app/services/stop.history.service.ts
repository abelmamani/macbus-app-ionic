import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StopHistory } from '../models/stop.history.model';

@Injectable({
  providedIn: 'root'
})
export class StopHistoryService {
  private readonly maxItems = 5;
  private readonly localStorageKey = 'stopHistory';
  private historySubject: BehaviorSubject<StopHistory[]> = new BehaviorSubject<StopHistory[]>(this.getSortedHistory());
  public history$ = this.historySubject.asObservable();

  getSortedHistory(): StopHistory[] {
    const history = this.getHistory();
    return history.sort((a, b) => b.timestamp - a.timestamp);
  }

  private getHistory(): StopHistory[] {
    const history = localStorage.getItem(this.localStorageKey);
    return history ? JSON.parse(history) : [];
  }

  private saveHistory(history: StopHistory[]): void {
    const sortedHistory = history.sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem(this.localStorageKey, JSON.stringify(sortedHistory));
    this.historySubject.next(sortedHistory);
  }

  addStop(id: string, name: string): void {
    const history: StopHistory[] = this.getHistory();
    const existingIndex = history.findIndex(item => item.id === id);

    if (existingIndex !== -1) {
      history[existingIndex].name = name;
      history[existingIndex].timestamp = Date.now();
    } else {
      if (history.length >= this.maxItems) {
        history.shift();
      }
      history.push({ id, name, timestamp: Date.now() });
    }

    this.saveHistory(history);
  }

  removeStop(id: string): void {
    let history = this.getHistory();
    history = history.filter(item => item.id !== id);
    this.saveHistory(history); 
  }

  clearHistory(): void {
    localStorage.removeItem(this.localStorageKey);
    this.historySubject.next([]);
  }
}
