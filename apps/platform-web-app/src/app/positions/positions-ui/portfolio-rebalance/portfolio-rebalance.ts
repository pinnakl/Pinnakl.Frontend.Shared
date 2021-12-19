import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Broker, PinnaklColDef } from '@pnkl-frontend/shared';
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'portfolio-rebalance',
  templateUrl: './portfolio-rebalance.html'
})
export class PortfolioRebalanceComponent implements OnInit {
  @Input() accounts: any;
  @Input() funds: any[];
  @Input() brokers: Broker[];
  @Output()
  rebalanceRequest = new EventEmitter<{
    options: FormGroup;
    selectedRows: any[];
  }>();
  @Output() gobackRequest = new EventEmitter<{ id: string }>();
  portfolioRebalForm: FormGroup;
  autoGroupColumnDef: any;
  gridOptions: GridOptions;
  columnDefs: PinnaklColDef[];
  gridData: any[];
  tradeDate: Date = new Date();

  constructor(private readonly fb: FormBuilder) {
    this.gridOptions = {
      context: {
        componentParent: this
      },
      onGridReady: params => {
        setTimeout(() => {
          params.api.selectAll();
          params.api.sizeColumnsToFit();
        }, 0);
      },
      rowSelection: 'multiple',
      suppressRowClickSelection: true
    };
    this.columnDefs = [
      {
        headerName: 'Select',
        maxWidth: 60,
        enableRowGroup: true,
        checkboxSelection: true
      },
      {
        headerName: 'Account',
        field: 'accountCode',
        maxWidth: 80,
        enableRowGroup: true,
        cellRenderer: this.toUpperCase
      },
      {
        headerName: 'Description',
        field: 'name',
        enableRowGroup: true,
        cellRenderer: this.toUpperCase
      }
    ];
  }

  ngOnInit(): void {
    this.portfolioRebalForm = this.fb.group({
      fundsId: [, Validators.required],
      date: [this.tradeDate, Validators.required],
      brokersId: [, Validators.required],
      commissionType: [, Validators.required],
      commission: [, Validators.required]
    });

    this.setGridData();
  }

  setGridData(): void {
    this.gridData = this.accounts;
    setTimeout(() => {
      this.gridOptions.api.selectAll();
      this.gridOptions.api.sizeColumnsToFit();
    }, 0);
  }

  showRebalanced(options: FormGroup): void {
    if (options.valid) {
      const selectedRows = this.gridOptions.api.getSelectedRows();
      this.rebalanceRequest.emit({ options, selectedRows });
    }
  }

  private toUpperCase(params: any): string {
    if (params && params.value) {
      return params.value.toString().toUpperCase();
    } else {
      return '';
    }
  }

  goback(): void {
    const id = 'optionsback';
    this.gobackRequest.emit({ id });
  }

  reset(): void {
    setTimeout(() => {
      this.gridOptions.api.selectAll();
    }, 0);
    this.portfolioRebalForm.reset();
    this.portfolioRebalForm.patchValue({
      date: new Date(),
      commission: null
    });
  }
}
