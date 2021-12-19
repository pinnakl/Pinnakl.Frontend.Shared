import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';

import { ValueFormatterParams } from 'ag-grid-community';
import { chain, groupBy, sumBy } from 'lodash';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  AumBackendStateFacade,
  CellRendererPositiveNegative,
  PinnaklColDef
} from '@pnkl-frontend/shared';
import { PnlBackendStateFacade } from '../../shared/pnl-backend-state/pnl-backend-state-facade.service';
import { PnlTopMover } from '../../shared/pnl-ui-state/models/pnl-top-mover.model';

@Component({
  selector: 'pnl-top-mover',
  templateUrl: './pnl-top-mover.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DecimalPipe],
  styleUrls: ['pnl-top-mover.component.scss']
})
export class PnlTopMoverComponent implements OnInit {
  @Input() set inverse(value: boolean) {
    this._inverse$.next(value);
    this.title = value ? 'Bottom 5 Movers' : 'Top 5 Movers';
  }

  constructor(
    private readonly _aumBackendStateFacade: AumBackendStateFacade,
    private readonly _decimalPipe: DecimalPipe,
    private readonly _pnlBackendStateFacade: PnlBackendStateFacade,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {}
  title = 'Top 5 Movers';

  colDefs: PinnaklColDef[];
  gridOptions = {
    unSortIcon: true
  };
  topMovers$: Observable<PnlTopMover[]>;
  rowData: PnlTopMover[];

  private readonly _inverse$ = new BehaviorSubject(false);

  private static _mapToPnlTopMover(
    aum: number,
    pnlCalculated: { assetType: string; description: string; totalPnl: number }
  ): PnlTopMover {
    return {
      assetType: pnlCalculated.assetType
        ? pnlCalculated.assetType.toUpperCase()
        : '',
      security: pnlCalculated.description,
      pnlPercentage: (pnlCalculated.totalPnl / aum) * 100 * 100
    };
  }

  ngOnInit(): void {
    this.colDefs = [
      {
        headerName: 'Asset Type',
        field: 'assetType',
        enableRowGroup: false,
        maxWidth: 110,
        minWidth: 100,
        suppressMenu: true
      },
      {
        headerName: 'Security',
        field: 'security',
        enableRowGroup: true,
        maxWidth: 200,
        minWidth: 180,
        suppressMenu: true
      },
      {
        headerName: 'BPS',
        field: 'pnlPercentage',
        cellRenderer: CellRendererPositiveNegative,
        cellStyle: { 'text-align': 'right' },
        filter: 'number',
        enableRowGroup: true,
        maxWidth: 80,
        minWidth: 70,
        suppressMenu: true,
        valueFormatter: (cell: ValueFormatterParams) => {
          const { value } = cell;
          if (!value && value !== 0) {
            return '';
          }
          try {
            return this._decimalPipe.transform(value, '1.2-2');
          } catch (e) {
            return value;
          }
        }
      }
    ];
    this._setTopMovers();
  }

  getRowNodeId({ assetType, security }: PnlTopMover): string {
    return `${assetType}*${security}`;
  }

  private _setTopMovers(): void {
    this.topMovers$ = combineLatest([
      this._aumBackendStateFacade.aumValue$,
      this._pnlBackendStateFacade.pnlCalculatedAttributes$,
      this._inverse$
    ]).pipe(
      map(([aum, pnlCalculatedAttribs, inverse]) => {
        const sortDirection = inverse ? 'asc' : 'desc';
        const pnlCalculatedGroups = groupBy(pnlCalculatedAttribs, 'securityId');
        const pnlForSecurities = Object.values(pnlCalculatedGroups).map(
          items => ({
            assetType: items[0].assetType,
            description: items[0].description,
            totalPnl: sumBy(items, item => item.totalPnl)
          })
        );

        return chain(pnlForSecurities)
          .orderBy([pnl => pnl.totalPnl], [sortDirection])
          .take(5)
          .map(pnlCalculated =>
            PnlTopMoverComponent._mapToPnlTopMover(aum, pnlCalculated)
          )
          .value();
      })
    );
    this.topMovers$.subscribe(
      data => {
        this.rowData = data;
        this._changeDetectorRef.detectChanges();
      },
      e => {
        console.log(e);
      }
    );
  }
}
