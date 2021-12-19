import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Event, NavigationEnd, Router } from '@angular/router';
import { CustomAttribute, CustomAttributeValue, UniveralSearchService, UniversalSearchFromAPI } from '@pnkl-frontend/shared';
import { debounce } from 'lodash';
import { ContactPhonesEditorComponent, ContactEmailAddressesEditorComponent } from '../../../../../../../apps/crm-app/src/app/crm/shared';
import { DistributionList } from '../../../../../../../apps/crm-app/src/app/crm/shared/distribution-list/distribution-list.model';
import { InvestorAddress } from '../../../../../../../apps/crm-app/src/app/crm/shared/investor-address/investor-address.model';
import { ContactEntity, ContactEntityPost, ContactMigration } from '../../../../../../../apps/crm-app/src/app/crm/shared/investor-contact';
import { PhoneType, Investor, InvestorService } from '../../../investor';
import { CustomAttributesValuesEditorComponent } from '../../../main/custom-attributes-values-editor/custom-attributes-values-editor.component';

@Component({
  selector: 'investor-contact-editor',
  templateUrl: './investor-contact-editor.component.html',
  styleUrls: ['./investor-contact-editor.component.scss']
})
export class InvestorContactEditorComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild(ContactPhonesEditorComponent)
  phonesForm: ContactPhonesEditorComponent;
  @ViewChild(ContactEmailAddressesEditorComponent)
  emailsForm: ContactEmailAddressesEditorComponent;
  @ViewChild(CustomAttributesValuesEditorComponent, { static: false })
  customAttributesComponent: CustomAttributesValuesEditorComponent;

  @Input() distLists: DistributionList[];
  @Input() editContact: ContactEntity;
  @Input() investorAddresses: InvestorAddress[] = [];
  @Input() phoneTypes: PhoneType[];
  @Input() isInitialEdit = true;
  @Input() isPrimary = false;
  @Input() customAttributes = [] as CustomAttribute[];
  @Input() customAttributeValues = [] as CustomAttributeValue[];
  @Input() investor: Investor;
  @Input() isWithoutInverstor = false;

  @Output() private onSubmit = new EventEmitter<ContactEntityPost>();
  @Output() private onEditorClose = new EventEmitter<ContactEntityPost>();
  @Output() private onMigrateOpen = new EventEmitter<any>();
  @Output() onMigrationHistoryOpen = new EventEmitter<ContactMigration[]>();
  @Output() customAttributesUpdated = new EventEmitter<CustomAttributeValue[]>();

  contactForm: FormGroup;
  salutations = ['Mr', 'Mrs', 'Ms'];
  showConfirmation = false;
  submitted = false;

  organizations: {
    OrganizationId: string;
    OrganizationName: string;
  }[] = [];

  private isEmailsValid = true;
  constructor(
		private readonly router: Router,
		private readonly fb: FormBuilder,
    private readonly univeralSearchService: UniveralSearchService,
    private readonly investorService: InvestorService,) {
  }

  ngOnInit(): void {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.resetParentForm();
        this.customAttributesComponent?.resetForm();
      }
    });
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.editContact &&
      changes.editContact.previousValue !== changes.editContact.currentValue
    ) {
      if (changes?.editContact?.currentValue) {
        this.patchForm();
      }
    }
  }

  ngOnDestroy(): void {

  }

  createForm(): void {
    this.contactForm = this.fb.group({
      salutation: [undefined],
      firstName: [undefined, Validators.required],
      lastName: [undefined, Validators.required],
      title: [undefined],
      preferredName: [undefined],
      isPrimary: [this.editContact ? this.editContact.isPrimary : this.isPrimary],
      phones: [[]],
      emailAddresses: [[]],
      distributionListContacts: [[]],
      postalAddressId: [],
      notes: [this.editContact?.notes, Validators.maxLength(500)],
      investorId: new FormControl(this.investor?.id || undefined, this.isWithoutInverstor && Validators.required)
    });
    this.patchForm();
  }

  patchForm(): void {
    if (this.contactForm && this.editContact) {
      this.contactForm.patchValue({
        ...this.editContact,
        distributionListContacts: this.editContact.distributionListContacts.map(
          ({ distListId }) => distListId
        )
      });
    }
  }

  resetParentForm(): void {
    this.contactForm.reset();
    this.showConfirmation = false;
    this.submitted = false;
    this.onEditorClose.emit();
  }

  validateChildForm(key: string, form: any): void {
    if (form.status === 'INVALID') {
      this.contactForm.controls[key].setValidators([Validators.required]);
    } else {
      this.contactForm.controls[key].setValidators(null);
    }
    this.contactForm.controls[key].updateValueAndValidity();
  }

  addPhone(): void {
    this.phonesForm.addEntity();
    this.validateChildForm('phones', this.phonesForm.formGroup);
  }

  addEmail(): void {
    this.emailsForm.addEntity();
    this.validateChildForm('emailAddresses', this.emailsForm.formGroup);
  }

  onMigrate(): void {
    this.onEditorClose.emit();
    this.onMigrateOpen.emit(this.editContact);
  }

  onDelete({ key, form }: { key: string; form: FormGroup }): void {
    this.validateChildForm(key, form);
  }

  saveContact(): void {
    this.submitted = true;
    if (this.contactForm.valid && this.isEmailsValid) {
      const contactEntity: ContactEntityPost = this.contactForm.value;
      const distributionListContacts = !contactEntity.distributionListContacts
        ? []
        : contactEntity.distributionListContacts.map((distListId: any) => {
          if (!this.editContact) {
            return { distListId };
          }
          const existingDistList = this.editContact.distributionListContacts.find(
            dlc => dlc.distListId === distListId
          );
          return {
            distListId,
            ...(existingDistList && { id: existingDistList.id })
          };
        });
      this.onSubmit.emit({
        ...contactEntity,
        distributionListContacts
      });
    }
  }

  onConfirmationCancel(): void {
    this.showConfirmation = false;
  }

  emailsChange(emailForm: FormArray): void {
    this.isEmailsValid = emailForm.valid;
  }

  saveCustomAttributes(contactId?: number): Promise<void> {
    return this.customAttributesComponent?.saveAttributes(contactId);
  }

  selectOrganizations(value) {
    if (value) {
      this.investorService.getOrganization(value.OrganizationId).then(resp => {
        this.investorAddresses = resp.investor.addresses;
      })
    } else {
      this.investorAddresses = [];
    }
  }

  getOrganizations(value: string) {
    if(value.length > 3) {
      this.debounceLoadOrganizations(value);
    }
  }

  debounceLoadOrganizations = debounce((value) => {
    this.univeralSearchService.getSearchOrganization<UniversalSearchFromAPI>(value, 'organization').then((resp) => {
      this.organizations = resp.map(el => JSON.parse(el.Result));
    })
  }, 300)
}
