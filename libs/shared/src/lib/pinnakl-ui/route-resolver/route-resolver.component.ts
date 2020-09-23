import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'route-resolver',
  templateUrl: './route-resolver.component.html',
  styleUrls: ['./route-resolver.component.scss']
})
export class RouteResolverComponent implements OnInit {
  title: string;
  headerClass: string;
  constructor(private route: ActivatedRoute, private router: Router) {}
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
  }
}
