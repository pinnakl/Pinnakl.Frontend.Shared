import { AfterViewInit, Component } from '@angular/core';
import {
  Event as RouterEvent,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router
} from '@angular/router';

import {
  AuthenticationService,
  Initializer,
  PinnaklSpinner,
  Toastr,
  UserService
} from '@pnkl-frontend/core';
import { environment } from '../environments';


@Component({
  selector: 'pnkl-frontend-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  enableBot = false;
  includeTesting = environment.includeTesting;
  menuOpen = false;
  showNotifications = false;
  showPasswordChangeDropdown = false;
  showUserActionsDropdown = false;
  version: string;
  isDev: boolean = !environment.production;

  constructor(
    private authenticationService: AuthenticationService,
    public userService: UserService,
    private initializer: Initializer,
    private router: Router,
    private toastr: Toastr,
    private spinner: PinnaklSpinner
  ) {
    this.version = 'dev';
  }

  ngAfterViewInit(): void {
    this.initializer.initialize();
    this.router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event);
    });
  }

  goToUrl(url: string): void {
    this.router.navigateByUrl(url);
  }

  async logout(): Promise<void> {
    try {
      await this.authenticationService.logout();
    } catch (e) {
      console.log(e);
    } finally {
      await this.router.navigate(['/login']);
      location.reload();
    }
  }

  showIncompleteScreens(): boolean {
    let show = false;
    const user = this.userService.getUser();
    if (user && (user.clientId === 2 || user.clientId === 3)) {
      show = true;
    }
    return show;
  }

  navigationInterceptor(event: RouterEvent): void {
    //console.log('printing event', event);

    if (event instanceof NavigationStart) {
      //this.spinner.spin();
    }
    if (event instanceof NavigationEnd) {
      // this.spinner.stop();
      if (event.url !== '/' && event.url !== '/login') {
        this.enableBot = false;
      }
    }
    if (event instanceof NavigationCancel) {
      this.spinner.stop();
    }
    if (event instanceof NavigationError) {
      this.toastr.error('An unexpected error occurred');
      this.spinner.stop();
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  togglePasswordChangeDropdown(): void {
    this.showPasswordChangeDropdown = !this.showPasswordChangeDropdown;
  }
}
