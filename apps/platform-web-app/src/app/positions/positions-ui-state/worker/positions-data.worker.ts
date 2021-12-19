/// <reference lib="webworker" />

import { PositionsGridDataProcessor } from './positions-grid-data-processor';

addEventListener('message', ({ data }) => {
  const { reportData, selectedColumns, allColumns, aumState, fxRate, calculateRebalance, rebalanceConfig, filters } = data;
  postMessage(
    new PositionsGridDataProcessor(reportData, selectedColumns, allColumns, aumState, fxRate, calculateRebalance, rebalanceConfig, filters)
      .processedGridData
  );
});
