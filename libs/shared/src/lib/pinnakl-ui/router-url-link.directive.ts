import { Directive, HostBinding, HostListener, Input, OnChanges, OnDestroy, isDevMode } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { Router, RouterEvent, NavigationEnd, UrlTree } from '@angular/router';
import { Subscription } from 'rxjs';

@Directive({ selector: 'a[routerUrlLink]' })
export class RouterUrlLinkWithHref implements OnChanges, OnDestroy {

    @HostBinding('attr.target') @Input() target: string;
    @Input() skipLocationChange: boolean;
    @Input() replaceUrl: boolean;

    private url: string;
    private subscription: Subscription;

    // the url displayed on the anchor element.
    @HostBinding() href: string;

    constructor(
        private readonly router: Router,
        private readonly locationStrategy: LocationStrategy) {
        this.subscription = router.events.subscribe((s: RouterEvent) => {
            if (s instanceof NavigationEnd) {
                this.updateTargetUrlAndHref();
            }
        });
    }

    @Input()
    set routerUrlLink(url: string | UrlTree) {
        if (url instanceof UrlTree) {
            this.url = url.toString();
        } else {
            this.url = url;
        }
    }

    @Input()
    set preserveQueryParams(value: boolean) {
        if (isDevMode() && <any>console && <any>console.warn) {
            console.warn('preserveQueryParams is deprecated, use queryParamsHandling instead.');
        }
    }

    ngOnChanges(changes: {}): any { this.updateTargetUrlAndHref(); }
    ngOnDestroy(): any { this.subscription.unsubscribe(); }

    @HostListener('click', ['$event.button', '$event.ctrlKey', '$event.metaKey', '$event.shiftKey'])
    onClick(button: number, ctrlKey: boolean, metaKey: boolean, shiftKey: boolean): boolean {
        if (button !== 0 || ctrlKey || metaKey || shiftKey) {
            return true;
        }

        if (typeof this.target === 'string' && this.target != '_self') {
            return true;
        }

        const extras = {
            skipLocationChange: attrBoolValue(this.skipLocationChange),
            replaceUrl: attrBoolValue(this.replaceUrl),
        };
        this.router.navigateByUrl(this.url, extras);
        return false;
    }

    private updateTargetUrlAndHref(): void {
        this.href = this.locationStrategy.prepareExternalUrl(this.url);
    }

}

function attrBoolValue(s: any): boolean {
    return s === '' || !!s;
}
