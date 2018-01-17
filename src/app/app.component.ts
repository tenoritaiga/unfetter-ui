import { Component,  OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState } from './app.service';
import { AuthService } from './core/services/auth.service';
import { WebAnalyticsService } from './core/services/web-analytics.service';
import * as fromApp from './root-store/app.reducers';
import * as userActions from './root-store/users/user.actions';
import * as configActions from './root-store/config/config.actions';
import * as notificationsActions from './root-store/notification/notification.actions';
import { WSMessageTypes } from './global/enums/ws-message-types.enum';
import { environment } from '../environments/environment';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Themes } from './global/enums/themes.enum';

@Component({
  selector: 'app',
  // encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.component.scss'
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public readonly showBanner = environment.showBanner || false;
  public readonly securityMarkingLabel = environment.bannerText || '';
  public readonly runMode = environment.runMode;
  public theme: Themes = Themes.DEFAULT;
  public title;

  constructor(
    public authService: AuthService,
    private webAnalyticsService: WebAnalyticsService,
    private store: Store<fromApp.AppState>,
    private router: Router,
    private activatedRoute: ActivatedRoute,

  ) {}

  public ngOnInit() {
    if (this.runMode && this.runMode === 'UAC') { 
      console.log('Running application in UAC mode');   
      if (this.authService.loggedIn()) {
        this.webAnalyticsService.recordVisit();
      }   
    } else if (this.runMode && this.runMode === 'DEMO') {
      console.log('Running application in DEMO mode');      
    }

    if (this.authService.loggedIn()) {
      const user = this.authService.getUser();
      const token = this.authService.getToken();
      this.store.dispatch(new userActions.LoginUser({ userData: user, token }));
      this.store.dispatch(new configActions.FetchConfig());
      this.store.dispatch(new notificationsActions.FetchNotificationStore());
    }

    const bodyElement: HTMLElement = document.getElementsByTagName('body')[0];

    this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .map(() => this.activatedRoute)
      .subscribe((event: ActivatedRoute) => {
        const url = ((event as any)._routerState.snapshot.url.split('/'))[1];
        this.setTheme(url, bodyElement);
        if (url === 'indicator-sharing') {
          this.title = 'Analytic Hub';
        } else {
          this.title = url;
        }
      });
  }

  private setTheme(url: string, bodyElement: HTMLElement) {
    switch (url) {
      case 'indicator-sharing':
        this.theme = Themes.ANALYTIC_HUB;
        break;
      case 'threat-dashboard':
        this.theme = Themes.THREAT_DASHBOARD;
        break;
      case 'assessments':
        this.theme = Themes.ASSESSMENTS;
        break;
      default:
        this.theme = Themes.DEFAULT;
    }

    if (url === 'intrusion-set-dashboard') {
      bodyElement.className = `${this.theme} hideFooter`;
    } else {
      bodyElement.className = this.theme;
    }
  }
}
