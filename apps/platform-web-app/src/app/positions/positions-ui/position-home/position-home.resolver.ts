import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { PMSConfig, PositionHomeService } from './position-home.service';

@Injectable()
export class PositionHomeResolver implements Resolve<any> {
  constructor(
    private readonly _positionHomeService: PositionHomeService,
    private readonly _spinner: PinnaklSpinner
  ) {}

  resolve(): Observable<PMSConfig> {
    return this._positionHomeService.getSavedPMSPreset().pipe(finalize(() => this._spinner.stop()));
  }
}
