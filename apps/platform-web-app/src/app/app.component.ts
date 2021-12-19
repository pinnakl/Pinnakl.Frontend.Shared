import { AfterViewInit, Component, HostListener, Self } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
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
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { environment } from '../environments';
import { NavBarService } from './nav.bar.service';


declare const require: any;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../../../../package.json');

@Component({
  selector: 'pnkl-frontend-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [NavBarService]
})
export class AppComponent implements AfterViewInit {
  enableBot = false;
  includeTesting = environment.includeTesting;
  menuOpen = false;
  showNotifications = false;
  showUserActionsDropdown = false;
  isDev = !environment.production;
  showMenu = false;
  hideChangePasswordModal = true;
  hideWideSearchDialog = true;

  searchForm = new FormGroup({
    security: new FormControl('')
  });

  private readonly unsubscribe$ = new Subject<void>();
  version: string;

  constructor(
    // private readonly authService: MsalService, // MS SSO service
    @Self() private readonly navBarService: NavBarService,
    private readonly authenticationService: AuthenticationService,
    public userService: UserService,
    private readonly initializer: Initializer,
    private readonly router: Router,
    private readonly toastr: Toastr,
    private readonly spinner: PinnaklSpinner,
    private readonly title: Title) {
    this.initResetPasswordSubscription();
    this.version = packageJson.version;
  }

  ngAfterViewInit(): void {
    this.initializer.initialize();
    this.router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event);
    });
  }

  searchModalOpen(): void {
    this.navBarService.searchModalOpen();
  }

  goToUrl(url: string): void {
    this.router.navigateByUrl(url);
  }

  async logout(): Promise<void> {
    // const msalUser = this.authService.instance.getAccountByUsername(this.userService.getUser().email);

    // if (msalUser?.name) {
    //   this.authenticationService.logout(true).then(() => {
    //     this.authService.instance.logout();
    //   });
    // } else {
    try {
      await this.authenticationService.logout();
    } catch (e) {
      console.log(e);
    } finally {
      location.reload();
    }
    this.showMenu = false;
    // }
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
    if (event instanceof NavigationStart) {
      // this.spinner.spin();
    }
    if (event instanceof NavigationEnd) {
      // this.spinner.stop();
      if (event.url !== '/' && event.url !== '/login') {
        this.enableBot = false;
        this.changeTitle(event);
        this.showMenu = true;
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

  async navigateToSettings(): Promise<void> {
    if (this.userService.getUser()) {
      await this.router.navigate(['/settings']);
    }
  }

  private changeTitle(event: NavigationEnd): void {
    const urlToTitle = {
      dashboard: 'dashboard',
      oms: 'OMS',
      ems: 'EMS',
      pms: 'PMS',
      pricing: 'Pricing',
      risk: 'Risk',
      reconciliation: 'Reconciliation',
      pnl: 'P&L',
      reporting: 'Reporting',
      'shadow-nav': 'Shadow nav',
      securities: 'Securities',
      testing: 'testing',
      rebalancing: 'Rebalancing',
      'cash-flow': 'Cash flow',
      'stock-loan': 'Stock loan',
      'corporate-actions': 'Corporate actions',
      'api-playground': 'api playground'
    };
    let title = 'Pinnakl';
    const urlParts = event.url.split('/');
    if (urlParts.length > 1 && Object.keys(urlToTitle).includes(urlParts[1])) {
      title = `Pinnakl - ${urlToTitle[urlParts[1]]}`;
    }
    this.title.setTitle(title);
  }

  @HostListener('document:visibilitychange', ['$event'])
  visibilityChangeHandler(): void {
    // If logout was clicked on another tab
    if (!document.hidden && !this.userService.getUser()?.token) {
      const name = localStorage.getItem('name');
      localStorage.clear();
      localStorage.setItem('name', name);
      this.router.navigate(['/login']);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPress($event: KeyboardEvent) {
    if (($event.ctrlKey || $event.metaKey) && $event.code === 'KeyS') {
      $event.preventDefault();
      $event.stopImmediatePropagation();
      this.navBarService.searchModalOpen();
    }
  }

  // @HostListener('window:unload', [ '$event' ])
  // unloadHandler(event: any): void {}

  private initResetPasswordSubscription(): void {
    this.userService.isResetPassword$
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((resetPassword: { isLoginPass: boolean, isPageReady: boolean }) => resetPassword.isLoginPass && resetPassword.isPageReady))
      .subscribe(() => this.hideChangePasswordModal = false);
  }
}
