import { NO_ERRORS_SCHEMA } from '@angular/core';
import { waitForAsync } from '@angular/core/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { PinnaklSpinner, PinnaklSpinnerStub, Toastr, ToastrStub } from '@pnkl-frontend/core';
import { Bond, BondService, Utility } from '@pnkl-frontend/shared';

import { SecuritiesTestHelper } from '../../securities-helper.service.spec';
import { SecuritiesHelper } from '../../shared/securities-helper.service';
import { BondAdditionalInformationComponent } from './bond-additional-information.component';

describe('BondAdditionalInformationComponent (inline template)', () => {
  let comp: BondAdditionalInformationComponent,
    fixture: ComponentFixture<BondAdditionalInformationComponent>,
    page: BondAdditionalInformationPage,
    testHelper: SecuritiesTestHelper;

  const asset = {
    callIndicator: true,
    convertibleIndicator: true,
    defaultIndicator: true,
    pikIndicator: true,
    putIndicator: true,
    sinkIndicator: false,
    strippableIndicator: true,
    underlyingSecurityId: 123
  };

  // async beforeEach
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BondAdditionalInformationComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: PinnaklSpinner, useClass: PinnaklSpinnerStub },
        { provide: Toastr, useClass: ToastrStub },
        { provide: BondService, useClass: BondServiceStub },
        SecuritiesHelper,
        Utility
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents(); // compile template and css
  }));

  function createComponent(): void {
    fixture = TestBed.createComponent(BondAdditionalInformationComponent);
    comp = fixture.componentInstance;
    comp.asset = asset;
    testHelper = new SecuritiesTestHelper();
    page = new BondAdditionalInformationPage();
    fixture.detectChanges();
    page.addPageElements(comp, fixture);
  }

  beforeEach(waitForAsync(() => {
    createComponent();
  }));

  it('should have save and cancel disabled initially', () => {
    testHelper.testSaveAndCancelDisability(fixture, page);
  });

  it('should enable save/cancel button', () => {
    comp.form.controls['underlyingSecurityId'].markAsDirty();
    fixture.detectChanges();

    expect(page.cancelBtn.disabled).toBeFalsy();
    expect(page.saveBtn.disabled).toBeFalsy();
  });

  it('should display toaster for no changes to save', () => {
    const toastrService = fixture.debugElement.injector.get(Toastr),
      spyOnPostCall = spyOn(toastrService, 'info').and.callThrough();
    comp.form.patchValue(asset);
    comp.form.markAsDirty();
    fixture.detectChanges();
    page.saveBtn.click();
    expect(toastrService.info).toHaveBeenCalled();
    expect(spyOnPostCall.calls.any()).toBe(true);
  });

  it('should display save will work once form is valid', () => {
    const bondService = fixture.debugElement.injector.get(BondService),
      spyOnPostCall = spyOn(bondService, 'putBond').and.callThrough();
    comp.form.controls['underlyingSecurityId'].setValue(1234);
    comp.form.markAsDirty();
    fixture.detectChanges();
    page.saveBtn.click();
    expect(bondService.putBond).toHaveBeenCalled();
    expect(spyOnPostCall.calls.any()).toBe(true);
  });

  it('should display confirm action on click of cancel', () => {
    comp.form.markAsDirty();
    fixture.detectChanges();
    page.cancelBtn.click();
    expect(comp.cancelConfirmationVisible).toBe(true);
  });
});

class BondAdditionalInformationPage {
  cancelBtn: HTMLButtonElement;
  saveBtn: HTMLButtonElement;

  defaultCb: HTMLInputElement;
  pikCb: HTMLInputElement;
  putableCb: HTMLInputElement;
  callableCb: HTMLInputElement;

  addPageElements(
    comp: BondAdditionalInformationComponent,
    fixture: ComponentFixture<BondAdditionalInformationComponent>
  ): void {
    if (comp.asset) {
      this.saveBtn = fixture.debugElement.query(
        By.css('.btn-save')
      ).nativeElement;
      this.cancelBtn = fixture.debugElement.query(
        By.css('.btn-cancel')
      ).nativeElement;

      this.defaultCb = fixture.debugElement.query(
        By.css('input[formControlName="defaultIndicator"]')
      ).nativeElement;
      this.pikCb = fixture.debugElement.query(
        By.css('input[formControlName="pikIndicator"]')
      ).nativeElement;
      this.putableCb = fixture.debugElement.query(
        By.css('input[formControlName="putIndicator"]')
      ).nativeElement;
      this.callableCb = fixture.debugElement.query(
        By.css('input[formControlName="callIndicator"]')
      ).nativeElement;
    }
  }
}

export class BondServiceStub {
  putBond(entityToSave: Bond): Promise<Bond> {
    return Promise.resolve(entityToSave);
  }
}
