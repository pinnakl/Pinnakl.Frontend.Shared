import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
	Output
} from '@angular/core';

import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { TradeWorkflowSpecsBackendStateFacade } from '@pnkl-frontend/shared';
import {
  ReportingColumn,
  ReportParameter,
  UserReportIdcColumn
} from '@pnkl-frontend/shared';
import { PositionsBackendStateFacade } from '../../positions-backend-state/positions-backend-state-facade.service';
import { PositionsUiStateFacade } from '../../positions-ui-state/positions-ui-state-facade.service';

@Component({
  selector: 'positions-filter',
  templateUrl: './positions-filter.component.html',
  styleUrls: ['./positions-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('filterVisibleChanged', [
      state('1', style({ transform: 'translateX(0px)', display: 'block' })),
      state('0', style({ transform: 'translateX(100%)', display: 'block' })),
      transition('* => *', animate('300ms'))
    ])
  ]
})
export class PositionsFilterComponent implements OnInit {
  @Input() filterVisible;
  @Input() showListedSecuritiesButton = false;

  @Output() onFilterApply = new EventEmitter();

  columns$: Observable<(ReportingColumn & { dropdownOptions: string[] })[]>;
  parameters$: Observable<ReportParameter[]>;
  realtimePortfolioOn$: Observable<boolean>;

  activeApplyFilter = false;
  suppressSelection = false;

  constructor(
    private readonly positionsBackendStateFacade: PositionsBackendStateFacade,
    private readonly positionsUiStateFacade: PositionsUiStateFacade,
    private readonly tradeWorkflowSpecsBackendStateFacade: TradeWorkflowSpecsBackendStateFacade
  ) {}

  applyDefault(): void {
    this.positionsUiStateFacade.selectDefaultPositionsReportSelectedColumns();
  }

  ngOnInit(): void {
    this.columns$ = this.positionsUiStateFacade.positionsFilterColumns$;
    this.parameters$ = this.positionsUiStateFacade.positionsFilterParameterValues$;
    this.realtimePortfolioOn$ = this.tradeWorkflowSpecsBackendStateFacade.realtimePortfolioOn$;
  }

  onApply(): void {
    const idcColumnsAdded = this._idcColumnsAdded();
    if (this.activeApplyFilter || idcColumnsAdded.length) {
      this.positionsUiStateFacade.applyPositionsFilter(idcColumnsAdded);
      this.activeApplyFilter = false;
    }
    this.onFilterApply.emit();
  }

  onColumnsChange(columns: Partial<ReportingColumn>[]): void {
    this.positionsUiStateFacade.updatePositionsReportSelectedColumns(columns);
  }

  onParameterChange(params: ReportParameter[]): void {
    this.positionsUiStateFacade.updatePositionsFilterParameterValues(params);
    this.activeApplyFilter = true;
  }

  onReset(): void {
    let columnsToReset: ReportingColumn[];
    this.columns$.subscribe(columns => (columnsToReset = columns));
    columnsToReset.forEach(column => {
      column.filters = null;
      column.include = true;
    });
    this.onColumnsChange(columnsToReset);
  }

  private _idcColumnsAdded(): ReportingColumn[] {
    let userReportIdcColumns: UserReportIdcColumn[];
    this.positionsBackendStateFacade.positionsReportUserReportIdcColumns$
      .pipe(first())
      .subscribe(x => (userReportIdcColumns = x));
    let selectedColumns: ReportingColumn[];
    this.positionsUiStateFacade.positionsReportSelectedColumns$
      .pipe(first())
      .subscribe(x => (selectedColumns = x));
    return selectedColumns.filter(
      ({ name, reportingColumnType }) =>
        reportingColumnType === 'idc' &&
        !userReportIdcColumns.some(uric => uric.name === name)
    );
  }
}
