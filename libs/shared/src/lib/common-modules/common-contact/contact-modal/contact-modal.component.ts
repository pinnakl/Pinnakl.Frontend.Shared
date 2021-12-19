import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Utility } from '@pnkl-frontend/shared';
import { CrmOptions } from '@pnkl-frontend/shared-investor';
import { Toastr, PinnaklSpinner } from '@pnkl-frontend/core';
import { ContactEntityStore, ContactEntityPost } from '../../../../../../../apps/crm-app/src/app/crm/shared/investor-contact';

@Component({
  selector: 'app-contact-modal',
  templateUrl: './contact-modal.component.html',
  styleUrls: ['./contact-modal.component.scss'],
})
export class ContactModalComponent {

  @Input() crmOptions: CrmOptions;

  @Output() onEditorClose = new EventEmitter<any>();

  constructor(
    private readonly contactEntityStore: ContactEntityStore,
    private readonly toastr: Toastr,
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly utility: Utility,
  ) { }

  saveContact(value): void {
    this.post(value);
  }

  private async post(contactEntity: ContactEntityPost): Promise<void> {
    contactEntity.investorId = contactEntity.investorId['OrganizationId'];
    contactEntity.isPrimary = !!contactEntity.isPrimary;
    try {
      this.pinnaklSpinner.spin();
      await this.contactEntityStore.post(
        contactEntity,
        contactEntity['investorId']['OrganizationId']
      );

      this.pinnaklSpinner.stop();
      this.toastr.success('Success!');
      this.onEditorClose.emit();
    } catch (e) {
      this.utility.showError(e);
    }
  }
}

