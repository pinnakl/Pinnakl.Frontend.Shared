import { async } from '@angular/core/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ConfirmActionHostComponent } from './confirm-action-host.component.test';
import { ConfirmAction } from './confirm-action.component';

describe('OrganizationsComponent (inline template)', () => {
  let comp: ConfirmActionHostComponent,
    fixture: ComponentFixture<ConfirmActionHostComponent>,
    page: ConfirmActionPage;

  // async beforeEach
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmActionHostComponent, ConfirmAction],
      imports: [BrowserAnimationsModule]
    }).compileComponents(); // compile template and css
  }));

  function createComponent(): void {
    fixture = TestBed.createComponent(ConfirmActionHostComponent);
    comp = fixture.componentInstance;
    page = new ConfirmActionPage();
    fixture.detectChanges();
    page.addPageElements(comp, fixture);
  }

  beforeEach(async(() => {
    createComponent();
  }));

  it('should check visibility of confirm action', () => {
    comp.showConfirmAction = true;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.row'))).toBeDefined();

    comp.showConfirmAction = false;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.row'))).toBeNull();
  });

  it('should verify confirmation message text', () => {
    fixture.detectChanges();
    expect(page.confirmationMsgEl.innerText).toBe(comp.confirmationMessage);
  });

  it('should verify confirmation message css class', () => {
    comp.messageClass = 'btn';
    fixture.detectChanges();
    page.addPageElements(comp, fixture);
    expect(page.confirmationMsgEl.classList).toContain(comp.messageClass);
  });

  it('should verify confirm-ation ok button click events', () => {
    let confirmActionSpy = spyOn(comp, 'onConfirm').and.callThrough();
    page.saveBtn.click();
    fixture.detectChanges();
    expect(confirmActionSpy.calls.any()).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.row'))).toBeNull();
  });

  it('should verify confirm-ation cancel button click events', () => {
    let cancelActionSpy = spyOn(comp, 'onCancel').and.callThrough();
    page.cancelBtn.click();
    fixture.detectChanges();
    expect(cancelActionSpy.calls.any()).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.row'))).toBeNull();
  });
});

class ConfirmActionPage {
  confirmationMsgEl: HTMLElement;
  cancelBtn: HTMLButtonElement;
  saveBtn: HTMLButtonElement;

  constructor() {}

  addPageElements(
    comp: ConfirmActionHostComponent,
    fixture: ComponentFixture<ConfirmActionHostComponent>
  ): void {
    if (comp.showConfirmAction) {
      this.saveBtn = fixture.debugElement.query(
        By.css('.icon-pinnakl-ok')
      ).nativeElement;
      this.cancelBtn = fixture.debugElement.query(
        By.css('.icon-pinnakl-cancel')
      ).nativeElement;
      this.confirmationMsgEl = fixture.debugElement.query(
        By.css(`.col-md-9,.${comp.messageClass}`)
      ).nativeElement;
    }
  }
}
