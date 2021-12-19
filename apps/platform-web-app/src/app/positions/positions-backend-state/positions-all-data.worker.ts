/// <reference lib="webworker" />

import { calculateObjectFieldsWithFormulas } from '../worker-helpers';

addEventListener('message', ({ data }) => {
  const { reportData, allColumns, aum, filters } = data;
  postMessage(
    reportData.map(item => calculateObjectFieldsWithFormulas(item, [item.AccountId], allColumns, aum, filters))
  );
});
