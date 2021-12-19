import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import { PeLoan } from '@pnkl-frontend/shared';
import { Security } from '@pnkl-frontend/shared';
import { ICellRendererParams } from 'ag-grid-community';
import { PeloanService } from '../peloan/peloan.service';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { AmortSchedule, AmortScheduleService } from './amort-schedule-backend';

@Component({
  selector: 'amort-schedule',
  templateUrl: './amort-schedule.component.html',
  styleUrls: ['./amort-schedule.component.scss'],
  providers: [DatePipe, DecimalPipe]
})
export class AmortScheduleComponent implements OnInit {
  @Input() peLoanId: number;
  peLoan: PeLoan;
  faceAmount: number;
  columnDefs;
  security: Security;
  amortSchedule: AmortSchedule[] = [];
  constructor(
    private readonly amortScheduleService: AmortScheduleService,
    private readonly datePipe: DatePipe,
    private readonly decimalPipe: DecimalPipe,
    private readonly peloanService: PeloanService,
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly spinner: PinnaklSpinner
  ) {}
  ngOnInit(): void {
    const securityId =
      this.securitiesHelper.securityDetailsResolvedData &&
      this.securitiesHelper.securityDetailsResolvedData.security
        ? this.securitiesHelper.securityDetailsResolvedData.security.id
        : null;
    if (!this.peLoanId) {
      this.spinner.spin();
      this.peloanService.getPeLoanFromSecurityId(securityId).then(data => {
        this.spinner.stop();
        this.peLoan = data;
        this.peLoanId = data.id;
        this.faceAmount = data.faceAmount;
      });
    } else {
      this.peloanService.getPeLoanDetailsById(this.peLoanId).then(data => {
        this.spinner.stop();
        this.peLoan = data;
        this.faceAmount = data.faceAmount;
      });
    }

    this.columnDefs = [
      {
        headerName: 'Amort Schedule Id',
        field: 'id'
      },
      {
        headerName: 'Payment Date',
        field: 'paymentDate',
        cellRenderer: data => data.value
            ? this.datePipe.transform(data.value, 'MM/dd/y')
            : ''
      },
      {
        headerName: 'Payment',
        field: 'payment',
        cellStyle: { 'text-align': 'right' },
        filter: 'number',
        valueFormatter: (cell: ICellRendererParams) => {
          const { value } = cell;
          const prefix = '$';
          if (!value && value !== 0) {
            return '';
          }
          try {
            return prefix + this.decimalPipe.transform(value, '1.2-2');
          } catch (e) {
            return prefix + value;
          }
        }
      },
      {
        headerName: 'Principal',
        field: 'principal',
        cellStyle: { 'text-align': 'right' },
        filter: 'number',
        valueFormatter: (cell: ICellRendererParams) => {
          const { value } = cell;
          const prefix = '$';
          if (!value && value !== 0) {
            return '';
          }
          try {
            return prefix + this.decimalPipe.transform(value, '1.2-2');
          } catch (e) {
            return prefix + value;
          }
        }
      },
      {
        headerName: 'Interest',
        field: 'interest',
        cellStyle: { 'text-align': 'right' },
        filter: 'number',
        valueFormatter: (cell: ICellRendererParams) => {
          const { value } = cell;
          const prefix = '$';
          if (!value && value !== 0) {
            return '';
          }
          try {
            return prefix + this.decimalPipe.transform(value, '1.2-2');
          } catch (e) {
            return prefix + value;
          }
        }
      },
      {
        headerName: 'Total Interest',
        field: 'totalInterest',
        cellStyle: { 'text-align': 'right' },
        filter: 'number',
        valueFormatter: (cell: ICellRendererParams) => {
          const { value } = cell;
          const prefix = '$';
          if (!value && value !== 0) {
            return '';
          }
          try {
            return prefix + this.decimalPipe.transform(value, '1.2-2');
          } catch (e) {
            return prefix + value;
          }
        }
      },
      {
        headerName: 'Balance',
        field: 'balance',
        cellStyle: { 'text-align': 'right' },
        filter: 'number',
        valueFormatter: (cell: ICellRendererParams) => {
          const { value } = cell;
          const prefix = '$';
          if (!value && value !== 0) {
            return '';
          }
          try {
            return prefix + this.decimalPipe.transform(value, '1.2-2');
          } catch (e) {
            return prefix + value;
          }
        }
      }
    ];
  }

  fetchAmortScheduleData(): void {
    // instead of the below code a call to backend custom API will be sent
    this.spinner.spin();
    this.peloanService.getPeLoanDetailsById(this.peLoanId).then(data => {
      this.peLoan = data;
      this.faceAmount = data.faceAmount;
      this.amortScheduleService.getAmortData(data).then(result => {
        this.amortSchedule = result;
        this.spinner.stop();
      });
    });

    // this.amortScheduleService
    //   .getAmortScheduleFromLoanId(this.peLoanId)
    //   .then(data => {
    //     this.amortSchedule = data;
    //     this.spinner.stop();
    //     console.log(data);
    //   });
  }
}
