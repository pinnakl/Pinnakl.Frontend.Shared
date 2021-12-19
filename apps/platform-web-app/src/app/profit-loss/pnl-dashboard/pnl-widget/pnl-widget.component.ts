import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ValueFormatterParams } from 'ag-grid-community';

import { PinnaklColDef } from '@pnkl-frontend/shared';
import { PnlDashboardWidget } from '../../shared/pnl-ui-state/models/pnl-dashboard-widget.model';

@Component({
  selector: 'pnl-widget',
  templateUrl: './pnl-widget.component.html',
  styleUrls: ['./pnl-widget.component.scss'],
  providers: [DecimalPipe]
})
export class PnlWidgetComponent {
  constructor(private readonly decimalPipe: DecimalPipe) {
    setTimeout(() => {
      this.colDefs = [
        { headerName: this.pnlWidgetInfo.fieldName, field: 'fieldValue' },
        {
          headerName: 'P&L',
          field: 'pnl',
          valueFormatter: (cell: ValueFormatterParams) => {
            const { value } = cell;
            if (!value && value !== 0) {
              return '';
            }
            const digitInfo = '1.2-2';
            try {
              return this.decimalPipe.transform(value, digitInfo);
            } catch (e) {
              return value;
            }
          }
        }
      ];
    });
  }
  @Input() pnlWidgetInfo: PnlDashboardWidget;
  @Output() onClose = new EventEmitter<void>();
  gridOptions = {
    unSortIcon: true
  };
  colDefs: PinnaklColDef[];
  colors = PnlWidgetComponent._createColors();
  selectedView = 'pie';

  seriesColors: string[] = [
    '#4E13CA',
    '#8652F5',
    '#4068FF',
    '#31C8FF',
    '#779CDC',
    '#F04400',
    '#FF28AE',
    '#FFC105',
    '#00A27C',
    '#0CF1A7'
  ];

  private static _createColors(): string[] {
    return [
      '#cfd7e5',
      '#00aae8',
      '#293542',
      '#f0f5ff',
      '#00b23e',
      '#f74053',
      '#ffb400'
    ];
  }

  onCloseClick(): void {
    this.onClose.emit();
  }
}
