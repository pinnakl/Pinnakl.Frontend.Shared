import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  waitForAsync
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { PinnaklSpinnerStub } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { ToastrStub } from '@pnkl-frontend/core';
import { ActivatedRouteStub, CurrencyService, RouterStub } from '@pnkl-frontend/shared';
import { CurrencyServiceStub } from '@pnkl-frontend/shared';
import { MarketService } from '@pnkl-frontend/shared';
import { MarketServiceStub } from '@pnkl-frontend/shared';
import { PublicIdentifierService } from '@pnkl-frontend/shared';
import { PublicIdentifierServiceStub } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { SecurityServiceStub } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { SecuritiesTestHelper } from '../../securities-helper.service.spec';
import { SecuritiesHelper } from '../../shared/securities-helper.service';
import { CurrencyInformationHostComponent } from './currency-information-host.component.test';
import { CurrencyInformationComponent } from './currency-information.component';

describe('CurrencyInformationComponent (inline template)', () => {
  let comp: CurrencyInformationHostComponent,
    fixture: ComponentFixture<CurrencyInformationHostComponent>,
    page: CurrencyInformationPage,
    testHelper: SecuritiesTestHelper;

  // async beforeEach
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        CurrencyInformationHostComponent,
        CurrencyInformationComponent
      ],
      imports: [ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: CurrencyService, useClass: CurrencyServiceStub },
        { provide: MarketService, useClass: MarketServiceStub },
        {
          provide: PublicIdentifierService,
          useClass: PublicIdentifierServiceStub
        },
        { provide: PinnaklSpinner, useClass: PinnaklSpinnerStub },
        { provide: SecuritiesHelper, useClass: SecuritiesHelper },
        { provide: SecurityService, useClass: SecurityServiceStub },
        { provide: Toastr, useClass: ToastrStub },
        { provide: Router, useClass: RouterStub },
        Utility
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents(); // compile template and css

    const activatedRouteInstance = TestBed.inject(ActivatedRoute);
    activatedRouteInstance.setSnapShotUrl('crncy');
  }));

  function createComponent(): void {
    fixture = TestBed.createComponent(CurrencyInformationHostComponent);
    comp = fixture.componentInstance;

    testHelper = new SecuritiesTestHelper();
    page = new CurrencyInformationPage();
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
    testHelper.testIsSaveAndCancelEnabled(comp, fixture, page);
  });

  it('should not send any post calls if there are no changes to save', () => {
    testHelper.testNoPostOnSaveClick(comp, fixture, page);
  });

  it('should not send any put calls if there are no changes to save', () => {
    testHelper.testNoPutOnSaveClick(comp, fixture, page);
  });

  it('should display toaster for no changes to save', () => {
    testHelper.testIsToastrErrorVisible(comp, fixture, page);
  });

  it('should display success toaster once save is performed', fakeAsync(() => {
    testHelper.testIsToastrSuccessVisible(comp, fixture, page);
  }));

  it('should display confirm action on click of cancel', () => {
    testHelper.testConfirmActionVisibility(comp, fixture, page);
  });
});

class CurrencyInformationPage {
  cancelBtn: HTMLButtonElement;
  saveBtn: HTMLButtonElement;

  addPageElements(
    comp: CurrencyInformationHostComponent,
    fixture: ComponentFixture<CurrencyInformationHostComponent>
  ): void {
    if (comp) {
      this.saveBtn = fixture.debugElement.query(
        By.css('.btn-save')
      ).nativeElement;
      this.cancelBtn = fixture.debugElement.query(
        By.css('.btn-cancel')
      ).nativeElement;
    }
  }
}
