import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
  {
    path: 'change-password',
    loadChildren:
      '@pnkl-frontend/authentication#ChangePasswordModule'
  },
  {
    path: 'dashboard',
    loadChildren:
      './dashboard/dashboard-ui/dashboard-ui.module#DashboardUiModule'
  },
  {
    path: 'help',
    loadChildren: '@pnkl-frontend/help#HelpModule'
  },
  {
    path: 'login',
    loadChildren: '@pnkl-frontend/authentication#AuthenticationModule'
  },
  {
    path: 'reporting',
    loadChildren: () =>
      import('@pnkl-frontend/reporting').then(m => m.ReportingModule)
  },
  {
    path: 'api-playground',
    loadChildren: './api-playground/api-playground.module#ApiPlaygroundModule'
  },
  // {
  //   path: 'sse-testing',
  //   loadChildren: 'app/sse-testing/sse-testing.module#SseTestingModule'
  // },
  {
    path: 'push-notification',
    loadChildren:
    '@pnkl-frontend/push-notifications-config#PushNotificationUiModule'
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
export class AppRoutingModule {}
