import { differenceBy, groupBy, isEqual, round, uniqWith } from 'lodash';
import { calculateObjectFieldsWithFormulas, fetchAum } from '../../worker-helpers';

export class PositionsGridDataProcessor {
  public processedGridData = [];
  constructor(
    private reportData: any[],
    private selectedColumns: any[],
    private allColumns: any[],
    private aumState: {
      accountId?: number;
      aum?: number;
      date?: Date;
    }[],
    private fxRate: number,
    private readonly calculateRebalance: boolean = false,
    private rebalanceConfig: any,
    private filters: any
  ) {
    this.processPositionsGridDataProcessor();
  }

  private processPositionsGridDataProcessor(): void {
    // Continue processing only if there are some columns selected
    if (!this.selectedColumns.length) {
      return;
    }

    // Filter data with filters from custom filter form
    this.filterData();

    // Extend selected columns with needed columns
    this.extendSelectedColumns();

    if (this.calculateRebalance) {
      // Recalculate rebalance fields
      this.recalculateRebalanceFields();
    }

    // Prepare mv percent map for calculating "side by side columns"
    // Important: it has to be before aggregation functionality
    const map = this.createAccountMVPercentMap();

    // Aggregate data and recalculate fields based on aggregation
    this.aggregateData();

    // Add accounts mv columns (f. e. MV17, MV18)
    this.extendReportDataWithAccountMVPercent(map);

    // Update data if fxRate is present
    this.updateDataWithFxRate();

    this.processedGridData = this.reportData;
  }

  private filterData(): void {
    const columnsWithFilters = this.selectedColumns.filter(
      sc => sc.filters && (sc.filters as string[]).length
    );
    if (columnsWithFilters.length) {
      this.reportData = this.reportData.filter(row =>
        columnsWithFilters.every(columnWithFilter =>
          (columnWithFilter.filters as string[]).includes(
            row[columnWithFilter.name]
          )
        )
      );
    }
  }

  private extendSelectedColumns(): void {
    // Add columns needed for rebalance to recalculate them
    this.extendSelectedColumnsWithColumnsForRebalance();

    // Add columns needed for calculations or something else
    this.extendSelectedColumnsWithNeededColumns();
  }

  private extendSelectedColumnsWithColumnsForRebalance(): void {
    this.selectedColumns = this.selectedColumns.concat([{
      include: false,
      name: 'rebalanceAdjBPS',
      type: 'numeric',
      reportingColumnType: 'report'
    } as any, {
      include: false,
      name: 'rebalanceAdjPct',
      type: 'numeric',
      reportingColumnType: 'report'
    } as any, {
      include: false,
      name: 'tradeQuantity',
      type: 'numeric',
      reportingColumnType: 'report'
    } as any, {
      include: false,
      name: 'tradeCost',
      type: 'numeric',
      reportingColumnType: 'report'
    } as any]);
  }

  private extendSelectedColumnsWithNeededColumns(): void {
    const columnsToAdd = [];
    if (this.reportData.some(row => row.AssetType === 'peloan')) {
      columnsToAdd.push({
        include: true,
        name: 'SecurityId',
        reportingColumnType: 'report'
      });
      columnsToAdd.push({
        include: true,
        name: 'AssetType',
        reportingColumnType: 'report'
      });
      columnsToAdd.push({
        include: true,
        name: 'peLoanId',
        reportingColumnType: 'report'
      });
    }
    const selectedColumnsNames = [
      ...this.selectedColumns,
      ...columnsToAdd
    ].map(
      c => c.name.toLowerCase()
    );
    if (!selectedColumnsNames.includes('securityid')) {
      columnsToAdd.push({
        include: true,
        name: 'SecurityId',
        reportingColumnType: 'report'
      });
    }
    if (!selectedColumnsNames.includes('customattributeid')) {
      columnsToAdd.push({
        include: true,
        name: 'CustomAttributeId',
        reportingColumnType: 'report'
      });
    }
    if (!selectedColumnsNames.includes('position')) {
      columnsToAdd.push({
        include: false,
        type: 'numeric',
        name: 'Position',
        isAggregating: true,
        reportingColumnType: 'report'
      });
    }
    this.selectedColumns.forEach(selCol => {
      if (selCol.type === 'numeric' && selCol.formula === 'custom') {
        columnsToAdd.push(selCol);
      }
    });
    this.selectedColumns = this.selectedColumns.concat(columnsToAdd);
  }

  private recalculateRebalanceFields(): void {
    const memoizedGetAumPerAccount = () => {
      const cache = {};
      return id => (id in cache) ? cache[id] : (cache[id] = this.calculateAum([id]));
    };
    const getAumPerAccount = memoizedGetAumPerAccount();

    const MVUSDLastPctMap = {};
    this.reportData.forEach(item => {
      if (!MVUSDLastPctMap[item.SecurityId]) {
        MVUSDLastPctMap[item.SecurityId] = {};
      }
      MVUSDLastPctMap[item.SecurityId][item.AccountCode] = item.MVUSDLastPct;
    });

    this.reportData = this.reportData.map(row => {
      const rowWithOnlySelectedColumns: any = {...row};


      rowWithOnlySelectedColumns.rebalanceAdjBPS = row.rebalanceAdjBPS === 0 ? 0 : (row.rebalanceAdjBPS || NaN);
      rowWithOnlySelectedColumns.rebalanceAdjPct = row.rebalanceAdjPct === 0 ? 0 : (row.rebalanceAdjPct || NaN);
      let tradeQuantity = row.tradeQuantity === 0 ? 0 : (row.tradeQuantity || NaN);

      if (rowWithOnlySelectedColumns.AssetType === 'EQUITY') {
        tradeQuantity = round(tradeQuantity, -2);
      } else if (rowWithOnlySelectedColumns.AssetType === 'OPTION') {
        tradeQuantity = round(tradeQuantity);
      }

      if (!isNaN(rowWithOnlySelectedColumns.rebalanceAdjPct)) {
        tradeQuantity = (
          (row.rebalanceAdjPct - MVUSDLastPctMap[row.SecurityId][row.AccountCode]) * 0.01 *
          getAumPerAccount(row.AccountId) / row.PriceLast) / (row?.Multiplier || 1) || null;

          if (rowWithOnlySelectedColumns.AssetType === 'EQUITY') {
            tradeQuantity = round(tradeQuantity, -2);
          } else if (rowWithOnlySelectedColumns.AssetType === 'OPTION') {
            tradeQuantity = round(tradeQuantity);
          }
          rowWithOnlySelectedColumns.tradeQuantity = tradeQuantity;
      }

      const factor = tradeQuantity > 0 ? -1 : 1;
      let commission;
      if (rowWithOnlySelectedColumns.AssetType === 'EQUITY') {
        commission = this.rebalanceConfig.EquityCommAssumption;
      } else if (rowWithOnlySelectedColumns.AssetType === 'OPTION') {
        commission = this.rebalanceConfig.OptionCommAssumption;
      }

      if (!isNaN(rowWithOnlySelectedColumns.tradeQuantity)) {
        rowWithOnlySelectedColumns.tradeCost = Math.round(
          tradeQuantity * ((row.PriceLast * -1) + (factor * commission)) * (row?.Multiplier || 1)
        ) || null;
      }

      if (isNaN(rowWithOnlySelectedColumns.rebalanceAdjPct) && !isNaN(rowWithOnlySelectedColumns.tradeQuantity)) {
        rowWithOnlySelectedColumns.rebalanceAdjPct = (
          rowWithOnlySelectedColumns.tradeQuantity * (row?.Multiplier || 1) * 100 * row.PriceLast /
          getAumPerAccount(row.AccountId)
        ) + MVUSDLastPctMap[row.SecurityId][row.AccountCode];
      }

      rowWithOnlySelectedColumns.UpdatedAt = row.UpdatedAt;

      return rowWithOnlySelectedColumns;
    });

    const tradeCostSum = this.reportData.reduce((acc, row) => {
      if (!acc[row.AccountId]) {
        acc[row.AccountId] = 0;
      }

      acc[row.AccountId] += (row.tradeCost || 0);
      return acc;
    }, {});

    this.reportData.forEach(data => {
      if (data.AssetType === 'CASH') {
        data.tradeCost = tradeCostSum[data.AccountId] || NaN;
      }
    });
  }

  private aggregateData(): void {
    const aggregatingSelectedColumns = this.selectedColumns.filter(
      sc =>
        sc.name !== 'Mark' &&
        sc.isAggregating &&
        ['numeric', 'stream', 'calculation'].includes(sc.type)
    );
    const aggregatingAllColumns = this.allColumns.filter(
      sc =>
        sc.name !== 'Mark' &&
        sc.isAggregating &&
        ['numeric', 'stream', 'calculation'].includes(sc.type)
    );

    if (aggregatingSelectedColumns.length) {
      const nonAggregatingColumns = differenceBy(
        this.selectedColumns,
        aggregatingSelectedColumns,
        column => column.reportingColumnType + column.name
      );

      const groups = groupBy(this.reportData, (data: any) => nonAggregatingColumns
        .filter(({name}) =>
          !['securityid', 'rebalanceadjbps', 'rebalanceadjpct', 'tradequantity', 'tradecost'].includes(name.toLowerCase())
        )
        .map(({name}) => data[name])
        .join('*')
      );

      this.reportData = Object.values(groups).map(items => {
        const accIds = new Set<number>();
        const firstItem = items[0];

        const nonAggregatingValues = {...firstItem};

        let aggregations = { };
        aggregatingAllColumns.forEach(({name}) => {
          aggregations[name] = 0;
        });
        aggregatingAllColumns.forEach(({name}) => {
          let latestUpdatedAt: Date;
          aggregations = items.reduce((aggregatedValues, item) => {
            accIds.add(item.AccountId);
            // Handle columns which are aggregating but should not be aggregated by account code/id with the same security id
            if (['mark', 'mvusdlastpct', 'mvusdpct'].includes(name.toLowerCase())) {
              if (latestUpdatedAt) {
                if (item.UpdatedAt > latestUpdatedAt) {
                  aggregatedValues[name] = item[name];
                  latestUpdatedAt = item.UpdatedAt;
                }
              } else {
                aggregatedValues[name] = item[name];
                latestUpdatedAt = item.UpdatedAt;
              }
            } else {
              // Handle aggregating columns which should be aggregated per security if no account code/id columns
              aggregatedValues[name] += item[name];
            }
            return aggregatedValues;
          }, aggregations);
        });

        // If user not show account code/id columns we should remove id and code fields from object
        // The presence of a account code/id is using in rebalance stuff
        const names = this.selectedColumns.map(c => c.name.toLowerCase());
        if (!names.includes('accountid') && !names.includes('accountcode')) {
          delete nonAggregatingValues.AccountId;
          delete nonAggregatingValues.AccountCode;
        }

        // Recalculate items
        return calculateObjectFieldsWithFormulas(
          {...nonAggregatingValues, ...aggregations},
          Array.from<number>(accIds),
          this.allColumns,
          this.aumState,
          this.filters
        );
      });
    } else {
      this.reportData = this.reportData.map(
        item => calculateObjectFieldsWithFormulas(item, [item.AccountId], this.allColumns, this.aumState, this.filters)
      );
    }
  }

  private calculateAum(ids: number[]): number {
    return ids
      .map(id => fetchAum(id, this.aumState))
      .reduce((a, b) => a + b, 0);
  }

  private totalAum(): number {
    return this.calculateAum(Array.from(new Set(this.reportData.map(d => d.AccountId))));
  }

  private createAccountMVPercentMap(): any {
    const accountMVPercentMap = {};
    const aumMap = {};
    this.aumState.forEach(i => {
      accountMVPercentMap[i.accountId] = {};
      aumMap[i.accountId] = fetchAum(i.accountId, this.aumState);
    });

    this.reportData.forEach(d => {
      accountMVPercentMap[d.AccountId][d.SecurityId] = Math.round((d.Position * d.Multiplier * d.Mark) / aumMap[d.AccountId] * 10000) / 100;
    });

    return accountMVPercentMap;
  }

  private extendReportDataWithAccountMVPercent(MVPercentMap: any): void {
    const accountsIds = this.aumState.map(aum => aum.accountId);

    this.reportData.forEach(data => {
      if (data.AccountId) {
        data[`MV${data.AccountId}`] = MVPercentMap[data.AccountId][data.SecurityId];
      } else {
        accountsIds.forEach(id => {
          data[`MV${id}`] = MVPercentMap[id][data.SecurityId];
        });
      }
    });
  }

  private updateDataWithFxRate(): void {
    if (this.fxRate) {
      const fxRateColumns = this.selectedColumns.filter(
        sc => sc.type === 'numeric' && sc.convertToBaseCurrency
      );
      if (fxRateColumns.length) {
        this.reportData = this.reportData.map(row => {
          const convertedValues = fxRateColumns.reduce(
            (converted, {name}) => ({
              ...converted,
              [name]: row[name] * this.fxRate
            }),
            {}
          );
          return {
            ...row,
            ...convertedValues
          };
        });
      }
    }
    this.reportData = uniqWith(this.reportData, isEqual);
  }
}
