import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { Future } from '@pnkl-frontend/shared';
import { FutureService } from '@pnkl-frontend/shared';
import { MarketService } from '@pnkl-frontend/shared';
import { PublicIdentifierService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../../shared/securities-helper.service';
import { SecurityInformationComponent } from '../../shared/security-information.component';

@Component({
  selector: 'future-information',
  templateUrl: 'future-information.component.html'
})
export class FutureInformationComponent extends SecurityInformationComponent {
  constructor(
    activatedRoute: ActivatedRoute,
    fb: FormBuilder,
    marketService: MarketService,
    pinnaklSpinner: PinnaklSpinner,
    publicIdentifierService: PublicIdentifierService,
    router: Router,
    securitiesHelper: SecuritiesHelper,
    securityService: SecurityService,
    toastr: Toastr,
    utility: Utility,
    private readonly futureService: FutureService
  ) {
    super(
      activatedRoute,
      fb,
      marketService,
      pinnaklSpinner,
      publicIdentifierService,
      router,
      securitiesHelper,
      securityService,
      toastr,
      utility
    );
  }

  protected createAssetForm(future: Future, fb: FormBuilder): FormGroup {
    if (!future) {
      return fb.group({
        contractSize: [],
        expirationDate: [],
        lastTradeableDate: [],
        tickSize: [],
        tickValue: [],
        valueOf1Pt: [],
        initialMargin: [],
        maintenanceMargin: []
      });
    }
    return fb.group({
      contractSize: [future.contractSize],
      expirationDate: [future.expirationDate],
      lastTradeableDate: [future.lastTradeableDate],
      tickSize: [future.tickSize],
      tickValue: [future.tickValue],
      valueOf1Pt: [future.valueOf1Pt],
      initialMargin: [future.initialMargin],
      maintenanceMargin: [future.maintenanceMargin]
    });
  }

  protected getUpdatedAsset(entity: Future, existingEntity: Future): Future {
    const updatedEntity = {} as Future;
    const contractSize = entity.contractSize;
    if (
      !this.utility.compareNumeric(contractSize, existingEntity.contractSize)
    ) {
      updatedEntity.contractSize = contractSize;
    }
    const expirationDate = entity.expirationDate;
    if (
      !this.utility.compareDates(expirationDate, existingEntity.expirationDate)
    ) {
      updatedEntity.expirationDate = expirationDate;
    }
    const lastTradeableDate = entity.lastTradeableDate;
    if (
      !this.utility.compareDates(
        lastTradeableDate,
        existingEntity.lastTradeableDate
      )
    ) {
      updatedEntity.lastTradeableDate = lastTradeableDate;
    }
    const tickSize = entity.tickSize;
    if (!this.utility.compareNumeric(tickSize, existingEntity.tickSize)) {
      updatedEntity.tickSize = tickSize;
    }
    const tickValue = entity.tickValue;
    if (!this.utility.compareNumeric(tickValue, existingEntity.tickValue)) {
      updatedEntity.tickValue = tickValue;
    }
    const valueOf1Pt = entity.valueOf1Pt;
    if (!this.utility.compareNumeric(valueOf1Pt, existingEntity.valueOf1Pt)) {
      updatedEntity.valueOf1Pt = valueOf1Pt;
    }
    const initialMargin = entity.initialMargin;
    if (!this.utility.compareNumeric(initialMargin, existingEntity.initialMargin)) {
      updatedEntity.initialMargin = initialMargin;
    }
    const maintenanceMargin = entity.maintenanceMargin;
    if (!this.utility.compareNumeric(maintenanceMargin, existingEntity.maintenanceMargin)) {
      updatedEntity.maintenanceMargin = maintenanceMargin;
    }


    if (_.isEqual(updatedEntity, {})) {
      return null;
    }
    updatedEntity.id = existingEntity.id;
    return updatedEntity;
  }

  protected postAsset(future: Future): Promise<Future> {
    return this.futureService.postFuture(future);
  }

  protected putAsset(future: Future): Promise<Future> {
    return this.futureService.putFuture(future);
  }

  protected resetAssetForm(future: Future, form: FormGroup): void {
    form.patchValue({
      asset: {
        contractSize: future.contractSize,
        expirationDate: future.expirationDate,
        lastTradeableDate: future.lastTradeableDate,
        tickSize: future.tickSize,
        tickValue: future.tickValue,
        valueOf1Pt: future.valueOf1Pt,
        initialMargin: future.initialMargin,
        maintenanceMargin: future.maintenanceMargin

      }
    });
  }
}
