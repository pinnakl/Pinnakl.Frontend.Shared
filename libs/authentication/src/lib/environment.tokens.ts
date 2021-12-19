import { InjectionToken } from '@angular/core';

export const PRODUCTION = new InjectionToken<boolean>('production');
export const DEFAULTSCREEN = new InjectionToken<{ prod: string, dev: string }>('defaultscreen');
export const USERTYPE = new InjectionToken<string>('usertype');
