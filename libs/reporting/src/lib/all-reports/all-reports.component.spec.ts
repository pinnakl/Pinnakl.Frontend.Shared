import { DebugElement } from '@angular/core';
import { async } from '@angular/core/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ReportGroup } from '../shared/report-group.model';
import { AllReportsComponent } from './all-reports.component';

import * as _ from 'lodash';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/multicast';

describe('AllReportsComponent (inline template)', () => {
  let comp: AllReportsComponent,
    fixture: ComponentFixture<AllReportsComponent>,
    page: AllReportsPage;

  // async beforeEach
  beforeEach(async(() => {
    let reportGroups: ReportGroup[] = [
      {
        reportCategory: 'Miscellaneous',
        clientReportList: [
          {
            id: 1,
            isPnklInternal: false,
            reportCategory: 'Miscellaneous',
            reportName: 'Monthly Holdings',
            reportId: 27
          },
          {
            id: 9,
            isPnklInternal: false,
            reportCategory: 'Miscellaneous',
            reportName: 'Dividend Rec Source Data',
            reportId: 14
          },
          {
            id: 20,
            isPnklInternal: false,
            reportCategory: 'Miscellaneous',
            reportName: 'Stock Loan',
            reportId: 6
          }
        ],
        userReportList: []
      },
      {
        reportCategory: 'Trades',
        clientReportList: [
          {
            id: 22,
            isPnklInternal: true,
            reportCategory: 'Trades',
            reportName: 'Daily Trade Blotter',
            reportId: 2
          },
          {
            id: 23,
            isPnklInternal: false,
            reportCategory: 'Trades',
            reportName: 'Trades Report Detailed',
            reportId: 2
          },
          {
            id: 24,
            isPnklInternal: false,
            reportCategory: 'Trades',
            reportName: 'Trades Report Aggregate',
            reportId: 2
          }
        ],
        userReportList: [
          {
            clientReportId: 22,
            id: 19,
            isPnklInternal: false,
            reportCategory: 'Trades',
            reportName: 'Testing decimaPlaces',
            reportId: 2,
            userId: 2
          }
        ]
      }
    ];

    TestBed.configureTestingModule({
      declarations: [AllReportsComponent],
      imports: [RouterTestingModule],
      providers: [{ provide: ActivatedRoute, useClass: ActivatedRouteStub }]
    }).compileComponents(); // compile template and css

    let activatedRouteInstance = TestBed.inject(ActivatedRoute);
    activatedRouteInstance.setSnapShot({ reportGroups });
  }));

  function createComponent(): void {
    fixture = TestBed.createComponent(AllReportsComponent);
    comp = fixture.componentInstance;
    page = new AllReportsPage();
    fixture.detectChanges();
    page.addPageElements(comp, fixture);
  }

  beforeEach(async(() => {
    createComponent();
  }));

  it('should display number of report categories', () => {
    fixture.detectChanges();
    expect(page.reportCategoryTitles.length).toBe(comp.reportGroups.length);
  });

  it('should match the report categories text', () => {
    fixture.detectChanges();
    for (let i = 0; i < page.reportCategoryTitles.length; i++) {
      expect(page.reportCategoryTitles[i].nativeElement.innerText).toBe(
        comp.reportGroups[i].reportCategory
      );
    }
  });

  it('should match the client report names', () => {
    fixture.detectChanges();
    for (let i = 0; i < page.reportCategoryTitles.length; i++) {
      for (let j = 0; j < page.clientReportsForCategories[i].length; j++) {
        expect(
          page.clientReportsForCategories[i][j].nativeElement.innerText
        ).toBe(comp.reportGroups[i].clientReportList[j].reportName);
      }
    }
  });

  it('should match the user report names', () => {
    fixture.detectChanges();
    for (let i = 0; i < page.reportCategoryTitles.length; i++) {
      for (let j = 0; j < page.userReportsForCategories[i].length; j++) {
        expect(
          page.userReportsForCategories[i][j].nativeElement.innerText
        ).toBe(comp.reportGroups[i].userReportList[j].reportName.trim());
      }
    }
  });
});

class AllReportsPage {
  reportCategoryTitles: DebugElement[];
  clientReportsForCategories: DebugElement[][] = [];
  userReportsForCategories: DebugElement[][] = [];

  addPageElements(
    comp: AllReportsComponent,
    fixture: ComponentFixture<AllReportsComponent>
  ): void {
    if (comp.reportGroups) {
      this.reportCategoryTitles = fixture.debugElement.queryAll(
        By.css('.report-card h2')
      );
      let reportsInReportsCategories = fixture.debugElement.queryAll(
        By.css('.report-card ul')
      );

      reportsInReportsCategories.map(category => {
        this.clientReportsForCategories.push(
          _.difference(
            category.queryAll(By.css('a')),
            category.queryAll(By.css('.ellipse-highlighter'))
          )
        );
        this.userReportsForCategories.push(
          category.queryAll(By.css('.ellipse-highlighter'))
        );
      });
    }
  }
}

class ActivatedRouteStub {
  snapshot = {};

  setSnapShot(data: any): void {
    this.snapshot = { data: data };
  }
}
