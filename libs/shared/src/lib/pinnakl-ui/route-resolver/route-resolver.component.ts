import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'route-resolver',
  templateUrl: './route-resolver.component.html',
  styleUrls: ['./route-resolver.component.scss']
})
export class RouteResolverComponent implements OnInit, OnDestroy {
  title: string;
  headerClass: string;
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly titleService: Title
    ) {}

  ngOnInit(): void {
    let { data, params } = this.route.snapshot,
      { title, headerClass, resolvingPath } = data as {
        title: string;
        headerClass: string;
        resolvingPath: string;
      };
    this.title = title;
    this.headerClass = headerClass;
    if (resolvingPath) {
      setTimeout(() => {
        this.router.navigate([resolvingPath, params], {
          skipLocationChange: true
        });
      });
    }
    this.titleService.setTitle('Pinnakl CRM - Geographic search');
  }

  ngOnDestroy() {
    this.titleService.setTitle('Pinnakl CRM');
  }
}
