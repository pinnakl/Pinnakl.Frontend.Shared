import { NO_ERRORS_SCHEMA } from '@angular/core';
import { waitForAsync } from '@angular/core/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { MockData } from './mock-data.spec';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { PinnaklSpinnerStub } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { ToastrStub } from '@pnkl-frontend/core';
import { ActivatedRouteStub, Organization } from '@pnkl-frontend/shared';
import { OrganizationService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { OrganizationsComponent } from './organizations.component';

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/multicast';

describe('OrganizationsComponent (inline template)', () => {
  let comp: OrganizationsComponent,
    fixture: ComponentFixture<OrganizationsComponent>,
    page: OrganizationsPage;

  // async beforeEach
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OrganizationsComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: OrganizationService, useClass: OrganizationServiceStub },
        { provide: PinnaklSpinner, useClass: PinnaklSpinnerStub },
        { provide: Toastr, useClass: ToastrStub },
        Utility
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents(); // compile template and css

    const activatedRouteInstance = TestBed.get(ActivatedRoute);
    activatedRouteInstance.setSnapShot({ resolvedData: MockData });
  }));

  function createComponent(): void {
    fixture = TestBed.createComponent(OrganizationsComponent);
    comp = fixture.componentInstance;
    page = new OrganizationsPage();
    fixture.detectChanges();
    page.addPageElements(comp, fixture);
  }

  beforeEach(waitForAsync(() => {
    createComponent();
  }));

  it('should have all save and cancel disabled initially', () => {
    fixture.detectChanges();
    expect(page.cancelBtn.disabled).toBeTruthy();
    expect(page.saveBtn.disabled).toBeTruthy();
  });

  it('should enable save/cancel button', () => {
    comp.form.controls['name'].setValue('test');
    comp.form.controls['name'].markAsDirty();
    fixture.detectChanges();

    expect(page.cancelBtn.disabled).toBeFalsy();
    expect(page.saveBtn.disabled).toBeFalsy();
  });

  it('form should be invalid till all the required values are not filled', () => {
    comp.form.reset();
    // Should be invalid with only country and name values
    comp.form.patchValue({
      countryCode: 'US',
      name: 'Alcoa Inc 5.125% 10/01/2024'
    });
    fixture.detectChanges();
    expect(comp.form.valid).toBeFalsy();

    // Should be invalid with only country, riskCountryCode, statusId and name values
    comp.form.patchValue({
      riskCountryCode: 'US',
      statusId: 6
    });
    fixture.detectChanges();
    expect(comp.form.valid).toBeFalsy();

    // Should be valid with all required values
    comp.form.patchValue({
      ticker: 'aa'
    });
    fixture.detectChanges();
    expect(comp.form.valid).toBeTruthy();
  });

  it('should display save will not work untill form is invalid', () => {
    const orgService = fixture.debugElement.injector.get(OrganizationService);

    const spyOnPostCall = spyOn(orgService, 'postOrganization');
    const spyOnPutCall = spyOn(orgService, 'putOrganization');

    comp.form.patchValue({
      countryCode: 'US',
      name: 'Alcoa Inc 5.125% 10/01/2024'
    });
    comp.form.markAsDirty();
    fixture.detectChanges();
    page.saveBtn.click();
    expect(spyOnPostCall.calls.any()).toBe(false, 'Post should not be called');
    expect(spyOnPutCall.calls.any()).toBe(false, 'Put should not be called');
  });

  it('should display save will work once form is valid', () => {
    const orgService = fixture.debugElement.injector.get(OrganizationService);
    const spyOnPostCall = spyOn(orgService, 'postOrganization').and.callThrough();

    comp.form.patchValue({
      countryCode: 'US',
      name: 'Alcoa Inc 5.125% 10/01/2024',
      riskCountryCode: 'US',
      statusId: 6,
      ticker: 'aa'
    });
    comp.form.markAsDirty();
    fixture.detectChanges();
    page.saveBtn.click();
    expect(orgService.postOrganization).toHaveBeenCalled();
    expect(spyOnPostCall.calls.any()).toBe(true);
  });

  it('should display confirm action on click of cancel', () => {
    comp.form.patchValue({
      countryCode: 'US',
      name: 'Alcoa Inc 5.125% 10/01/2024',
      riskCountryCode: 'US',
      statusId: 6,
      ticker: 'aa'
    });
    comp.form.markAsDirty();
    fixture.detectChanges();
    page.cancelBtn.click();
    expect(comp.cancelConfirmationVisible).toBe(true);
  });

  it('should display organization information selected in dropdown', () => {
    comp.organizationSelectionForm.patchValue({
      organization: MockData.organizations[1]
    });
    comp.organizationSelectionForm.markAsDirty();
    fixture.detectChanges();
    expect(comp.form.value.countryCode).toBe(
      MockData.organizations[1].countryCode
    );
    expect(comp.form.value.name).toBe(MockData.organizations[1].name);
    expect(comp.form.value.riskCountryCode).toBe(
      MockData.organizations[1].riskCountryCode
    );
    expect(comp.form.value.statusId).toBe(MockData.organizations[1].statusId);
    expect(comp.form.value.ticker).toBe(MockData.organizations[1].ticker);
  });
});

class OrganizationsPage {
  putOrganizationSpy: jasmine.Spy;
  postOrganizationSpy: jasmine.Spy;

  cancelBtn: HTMLButtonElement;
  nameInput: HTMLInputElement;
  saveBtn: HTMLButtonElement;

  addPageElements(
    comp: OrganizationsComponent,
    fixture: ComponentFixture<OrganizationsComponent>
  ): void {
    if (comp.countries) {
      this.nameInput = fixture.debugElement.query(
        By.css('pinnakl-input[controlname = "name"]')
      ).nativeElement;
      this.cancelBtn = fixture.debugElement.query(
        By.css('.btn-cancel')
      ).nativeElement;
      this.saveBtn = fixture.debugElement.query(
        By.css('.btn-success')
      ).nativeElement;
    }
  }
}

export class OrganizationServiceStub {
  postOrganization(entityToSave: Organization): Promise<Organization> {
    return Promise.resolve(entityToSave);
  }
  putOrganization(entityToSave: Organization): Promise<Organization> {
    return Promise.resolve(
      (MockData[1] as Organization[]).find(org => org.id === entityToSave.id)
    );
  }
}
