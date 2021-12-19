import { Component, Input, OnInit, ViewChild } from '@angular/core';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { AdminAccount } from '@pnkl-frontend/shared';
import { ClientConnectivity } from '@pnkl-frontend/shared';
import { AdminIdentifier } from '@pnkl-frontend/shared';
import { PbIdentifier } from '@pnkl-frontend/shared';
import { Security } from '@pnkl-frontend/shared';
import { AdminIdentifierService } from '@pnkl-frontend/shared';
import { PbIdentifierService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { AdminIdentifiersComponent } from './admin-identifiers/admin-identifiers.component';
import { PbIdentifiersComponent } from './pb-identifiers/pb-identifiers.component';

@Component({
  selector: 'external-identifiers',
  templateUrl: 'external-identifiers.component.html'
})
export class ExternalIdentifiersComponent implements OnInit {
  @Input() adminAccounts: AdminAccount[];
  admins: ClientConnectivity[];
  @Input() clientConnectivities: ClientConnectivity[];
  confirmationVisible = false;
  custodians: ClientConnectivity[];
  @Input() existingAdminIdentifiers: AdminIdentifier[];
  @Input() existingPbIdentifiers: PbIdentifier[];
  @Input() security: Security;

  @ViewChild(AdminIdentifiersComponent, { static: true })
  private adminIdentifiersComponent: AdminIdentifiersComponent;
  @ViewChild(PbIdentifiersComponent, { static: true })
  private pbIdentifiersComponent: PbIdentifiersComponent;

  constructor(
    private readonly adminIdentifierService: AdminIdentifierService,
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly pbIdentifierService: PbIdentifierService,
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly toastr: Toastr,
    private readonly utility: Utility
  ) { }

  hideConfirmation(): void {
    this.confirmationVisible = false;
  }

  ngOnInit(): void {
    this.admins = _.filter(this.clientConnectivities, ['entityType', 'ADMIN']);
    this.custodians = _.filter(this.clientConnectivities, ['entityType', 'PB']);
  }

  resetForm(): void {
    this.confirmationVisible = false;
    this.adminIdentifiersComponent.resetIdentifiersAndForm();
    this.pbIdentifiersComponent.resetIdentifiersAndForm();
  }

  saveAllIdentifiers(): void {
    this.pinnaklSpinner.spin();
    Promise.all([
      this.adminIdentifiersComponent.saveIdentifiers(),
      this.pbIdentifiersComponent.saveIdentifiers()
    ])
      .then(result => {
        const [adminIdentifiers, pbIdentifiers] = result;
        if (!adminIdentifiers && !pbIdentifiers) {
          return;
        }
        return Promise.all([
          adminIdentifiers
            ? this.adminIdentifierService.getIdentifiers(this.security.id)
            : null,
          pbIdentifiers
            ? this.pbIdentifierService.getIdentifiers(this.security.id)
            : null
        ]);
      })
      .then(result => {
        this.pinnaklSpinner.stop();
        if (!result) {
          this.toastr.info('No changes to update');
          return;
        }
        this.toastr.success('Changes saved successfully');
        const [adminIdentifiers, pbIdentifiers] = result;
        if (adminIdentifiers) {
          this.existingAdminIdentifiers = adminIdentifiers;
        }
        if (pbIdentifiers) {
          this.existingPbIdentifiers = pbIdentifiers;
        }
        this.securitiesHelper.formSubmitted.next();
      })
      .catch(this.utility.errorHandler.bind(this));
  }

  showConfirmation(): void {
    this.confirmationVisible = true;
  }
}
