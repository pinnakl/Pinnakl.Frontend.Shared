import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectNames } from '@pnkl-frontend/shared';

const appRoutes: Routes = [
  {
    path: 'settings',
    loadChildren: () => import('@pnkl-frontend/authentication').then(m => m.SettingsModule),
    data: { projectName: ProjectNames.PLATFORM_WEB }
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard-ui/dashboard-ui.module').then(m => m.DashboardUiModule)
  },
  {
    path: 'help',
    loadChildren: () => import('@pnkl-frontend/help').then(m => m.HelpModule)
  },
  {
    path: 'login',
    loadChildren: () => import('@pnkl-frontend/authentication').then(m => m.AuthenticationModule)
  },
  {
    path: 'pms',
    loadChildren: () => import('./positions/positions-ui/positions.module').then(m => m.PositionModule),
    data: { preload: true }
  },
 {
    path: 'pnl',
    loadChildren: () => import('./profit-loss/profit-loss.module').then(m => m.ProfitLossModule)
  },
  {
    path: 'reporting',
    loadChildren: () => import('@pnkl-frontend/reporting').then(m => m.ReportingModule),
    data: { projectName: ProjectNames.PLATFORM_WEB }
  },
  {
    path: 'securities',
    loadChildren: () => import('./securities/securities.module').then(m => m.SecuritiesModule)
  },
  {
    path: 'api-playground',
    loadChildren: () => import('@pnkl-frontend/shared').then(m => m.ApiPlaygroundModule)
  },
/*   {
    path: 'sse-testing',
    loadChildren: () => import('app/sse-testing/sse-testing.module').then(m => m.SseTestingModule)
  }, */
  {
    path: 'push-notification',
    loadChildren: () => import('@pnkl-frontend/push-notifications-config').then(m => m.PushNotificationUiModule)
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      useHash: true,
      onSameUrlNavigation: 'reload'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
