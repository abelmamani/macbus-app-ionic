// home.page.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MenuController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { busOutline, locationOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { PublicRoute } from 'src/app/models/routes.model';
import { StopHistory } from 'src/app/models/stop.history.model';
import { StopHistoryService } from 'src/app/services/stop.history.service';
import { getTimeAgo } from 'src/app/utils/time.utils';
import { NavOption } from './models/nav.option.model';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink],
})
export class HomePage  implements OnInit{
  navOptions: NavOption[] = [
    {title: 'Paradas', icon: 'location-outline', url: PublicRoute.BUS_STOPS},
    {title: 'Lineas', icon: 'bus-outline', url: PublicRoute.BUS_ROUTES},
  ];
  recentStops$!: Observable<StopHistory[]>;
  constructor(private stopHistoryService: StopHistoryService, private menuController: MenuController) {
    addIcons({locationOutline, busOutline});
  }

  ngOnInit(): void {
    this.recentStops$ = this.stopHistoryService.history$;
  }

  getTimeAgo(timestamp: number): string {
    return getTimeAgo(timestamp);
  }
  openMenu(){
    this.menuController.open();
  }
}