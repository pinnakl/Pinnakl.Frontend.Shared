import { ComponentFixture, tick } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { Toastr } from '@pnkl-frontend/core';
import { SecurityService } from '@pnkl-frontend/shared';

export const CURRENCIES = [
  {
    id: 1,
    currency: 'AUD'
  },
  {
    id: 2,
    currency: 'BRL'
  },
  {
    id: 3,
    currency: 'CAD'
  }
];

export const ORGANIZATIONS = [
  {
    countryCode: 'US',
    id: 1,
    name: 'Alcoa Inc 5.125% 10/01/2024',
    riskCountryCode: 'US',
    statusId: 6,
    ticker: 'aa'
  },
  {
    countryCode: 'US',
    id: 2,
    name: 'American Airline',
    riskCountryCode: 'US',
    statusId: 6,
    ticker: 'aal'
  },
  {
    countryCode: 'US',
    id: 3,
    name: 'Aal Us 01/17/15 C30',
    riskCountryCode: 'US',
    statusId: 6,
    ticker: 'aal 01/17/15 c30'
  },
  {
    countryCode: 'US',
    id: 4,
    name: 'Amr Corp',
    riskCountryCode: 'US',
    statusId: 6,
    ticker: 'aamrq'
  }
];

export const SECTOR_OPTIONS = [
  {
    id: 4916,
    optionDescription: 'OIL & GAS',
    optionValue: 'OIL & GAS'
  },
  {
    id: 4917,
    optionDescription: 'Consumer Discretionary',
    optionValue: 'Consumer Discretionary'
  },
  {
    id: 4918,
    optionDescription: 'AIRLINES',
    optionValue: 'AIRLINES'
  },
  {
    id: 4919,
    optionDescription: 'Chemicals',
    optionValue: 'Chemicals'
  },
  {
    id: 4920,
    optionDescription: 'REITS',
    optionValue: 'REITS'
  },
  {
    id: 4921,
    optionDescription: 'MORTGAGE',
    optionValue: 'MORTGAGE'
  },
  {
    id: 4922,
    optionDescription: 'Communications',
    optionValue: 'Communications'
  },
  {
    id: 4923,
    optionDescription: 'Utilities',
    optionValue: 'Utilities'
  },
  {
    id: 4924,
    optionDescription: 'Telecom Equip',
    optionValue: 'Telecom Equip'
  },
  {
    id: 4925,
    optionDescription: 'Telecoms',
    optionValue: 'Telecoms'
  },
  {
    id: 4926,
    optionDescription: 'Consumer, Cyclical',
    optionValue: 'Consumer, Cyclical'
  },
  {
    id: 4927,
    optionDescription: 'Consumer, Non-cyclical',
    optionValue: 'Consumer, Non-cyclical'
  },
  {
    id: 4928,
    optionDescription: 'Financial',
    optionValue: 'Financial'
  },
  {
    id: 4929,
    optionDescription: 'CASH',
    optionValue: 'CASH'
  },
  {
    id: 4930,
    optionDescription: 'Government',
    optionValue: 'Government'
  },
  {
    id: 4931,
    optionDescription: 'Financials',
    optionValue: 'Financials'
  },
  {
    id: 4932,
    optionDescription: 'CONSUMER',
    optionValue: 'CONSUMER'
  },
  {
    id: 4933,
    optionDescription: 'Industrial',
    optionValue: 'Industrial'
  },
  {
    id: 4934,
    optionDescription: 'Funds',
    optionValue: 'Funds'
  },
  {
    id: 4935,
    optionDescription: 'Energy',
    optionValue: 'Energy'
  },
  {
    id: 4936,
    optionDescription: 'Municipal',
    optionValue: 'Municipal'
  },
  {
    id: 4937,
    optionDescription: 'Automotive',
    optionValue: 'Automotive'
  },
  {
    id: 4938,
    optionDescription: 'PIPELINES',
    optionValue: 'PIPELINES'
  },
  {
    id: 4939,
    optionDescription: 'Health Care',
    optionValue: 'Health Care'
  },
  {
    id: 4940,
    optionDescription: 'Diversified',
    optionValue: 'Diversified'
  },
  {
    id: 4941,
    optionDescription: 'Basic Materials',
    optionValue: 'Basic Materials'
  },
  {
    id: 4942,
    optionDescription: 'Technology',
    optionValue: 'Technology'
  },
  {
    id: 4966,
    optionDescription: 'Apparel',
    optionValue: 'Apparel'
  },
  {
    id: 4967,
    optionDescription: 'Food & Beverage',
    optionValue: 'Food & Beverage'
  },
  {
    id: 4968,
    optionDescription: 'Gaming',
    optionValue: 'Gaming'
  },
  {
    id: 4969,
    optionDescription: 'Home & Office Products Manufacturing',
    optionValue: 'Home & Office Products Manufacturing'
  },
  {
    id: 4970,
    optionDescription: 'Industrial Other',
    optionValue: 'Industrial Other'
  },
  {
    id: 4971,
    optionDescription: 'Manufactured Goods',
    optionValue: 'Manufactured Goods'
  },
  {
    id: 4972,
    optionDescription: 'Media',
    optionValue: 'Media'
  },
  {
    id: 4973,
    optionDescription: 'Metals & Mining',
    optionValue: 'Metals & Mining'
  },
  {
    id: 4974,
    optionDescription: 'Paper products',
    optionValue: 'Paper products'
  },
  {
    id: 4975,
    optionDescription: 'Retail',
    optionValue: 'Retail'
  },
  {
    id: 4976,
    optionDescription: 'Transportation',
    optionValue: 'Transportation'
  },
  {
    id: 4977,
    optionDescription: 'Oil & Gas Services',
    optionValue: 'Oil & Gas Services'
  }
];

export const SECURITY_TYPES = [
  {
    assetTypeId: 6,
    id: 1,
    secType: 'equity',
    secTypeDescription: 'equity'
  },
  {
    assetTypeId: 4,
    id: 11,
    secType: 'claim',
    secTypeDescription: 'claim'
  },
  {
    assetTypeId: 2,
    id: 2,
    secType: 'corp',
    secTypeDescription: 'Corporate Bond'
  },
  {
    assetTypeId: 2,
    id: 3,
    secType: 'conv',
    secTypeDescription: 'Convertible Bond'
  },
  {
    assetTypeId: 2,
    id: 6,
    secType: 'govt',
    secTypeDescription: 'Treasury'
  },
  {
    assetTypeId: 2,
    id: 7,
    secType: 'muni',
    secTypeDescription: 'Muni'
  }
];

export class SecuritiesTestHelper {
  testSaveAndCancelDisability(fixture: ComponentFixture<any>, page: any): void {
    fixture.detectChanges();
    expect(page.cancelBtn.disabled).toBeTruthy();
    expect(page.saveBtn.disabled).toBeTruthy();
  }

  testIsSaveAndCancelEnabled(
    comp: any,
    fixture: ComponentFixture<any>,
    page: any
  ): void {
    (comp.assetInfoComponent.form.controls['security'] as FormGroup).controls[
      'description'
    ].markAsDirty();
    fixture.detectChanges();

    expect(page.cancelBtn.disabled).toBeFalsy();
    expect(page.saveBtn.disabled).toBeFalsy();
  }

  testNoPostOnSaveClick(
    comp: any,
    fixture: ComponentFixture<any>,
    page: any
  ): void {
    const securityService = fixture.debugElement.injector.get(SecurityService),
      spyOnPostCall = spyOn(securityService, 'postSecurity').and.callThrough();

    comp.assetInfoComponent.form.markAsDirty();
    fixture.detectChanges();
    page.saveBtn.click();
    expect(securityService.postSecurity).not.toHaveBeenCalled();
    expect(spyOnPostCall.calls.any()).toBe(false);
  }

  testNoPutOnSaveClick(
    comp: any,
    fixture: ComponentFixture<any>,
    page: any
  ): void {
    const securityService = fixture.debugElement.injector.get(SecurityService),
      spyOnPutCall = spyOn(securityService, 'putSecurity').and.callThrough();

    comp.assetInfoComponent.form.markAsDirty();
    fixture.detectChanges();
    page.saveBtn.click();
    expect(securityService.putSecurity).not.toHaveBeenCalled();
    expect(spyOnPutCall.calls.any()).toBe(false);
  }

  testIsToastrErrorVisible(
    comp: any,
    fixture: ComponentFixture<any>,
    page: any
  ): void {
    const toastrService = fixture.debugElement.injector.get(Toastr),
      spyOnToastrError = spyOn(toastrService, 'error').and.callThrough();
    comp.assetInfoComponent.form.markAsDirty();
    fixture.detectChanges();
    page.saveBtn.click();
    expect(toastrService.error).toHaveBeenCalled();
    expect(spyOnToastrError.calls.any()).toBe(true);
  }

  testIsToastrSuccessVisible(
    comp: any,
    fixture: ComponentFixture<any>,
    page: any
  ): void {
    const toastrService = fixture.debugElement.injector.get(Toastr),
      spyOnToastrSuccess = spyOn(toastrService, 'success').and.callThrough();
    comp.security.description = 'Test123';
    comp.assetInfoComponent.form.markAsDirty();
    fixture.detectChanges();
    page.saveBtn.click();
    tick();
    expect(toastrService.success).toHaveBeenCalled();
    expect(spyOnToastrSuccess.calls.any()).toBe(true);
  }

  testConfirmActionVisibility(
    comp: any,
    fixture: ComponentFixture<any>,
    page: any
  ): void {
    comp.assetInfoComponent.form.markAsDirty();
    fixture.detectChanges();
    page.cancelBtn.click();
    expect(comp.assetInfoComponent.cancelConfirmationVisible).toBe(true);
  }
}
