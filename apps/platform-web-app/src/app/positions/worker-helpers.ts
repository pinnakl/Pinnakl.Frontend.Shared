import { Parser } from 'expr-eval';
import { find } from 'lodash';

export const fetchAum = (accId: number, accountsAum: any[]): number => accountsAum.find(a => +a.accountId === accId)?.aum;

const objectKeysToLowerKeys = (obj: any): any => {
  const keys = Object.keys(obj);
  let n = keys.length,
    key;
  const newObj = {};
  while (n--) {
    key = keys[n];
    newObj[key.toLowerCase()] = obj[key];
  }
  return newObj;
};

const calculateFormula = (record, column) => {
  let value = 0;
  try {
    if (column.formula.toLowerCase().includes('undprc') && !record.undprc) {
      record.undprc = 1;
    }
    value = (new Parser()).parse(column.formula.toLowerCase()).evaluate(record);
  } catch (e) {
    console.log('Something went wrong during formula evaluation', e);
    console.log('Formula', column.formula.toLowerCase());
    console.log('Record', record);
  }
  return value;
};

const recalculateRecordWithColumnFormula = (record, aumIds, column, aumState) => {
  const aum = aumIds.map(id => fetchAum(id, aumState)).reduce((a, b) => a + b, 0);
  const lowercaseRecord = objectKeysToLowerKeys(record);
  return {
    ...record,
    [column.name]: (column.formula.toLowerCase().includes('mark') && objectKeysToLowerKeys(record).mark === 0)
      ? record[column.name]
      : calculateFormula({ ...lowercaseRecord, delta: (lowercaseRecord.delta || Math.random()), aum }, column)
  };
};

const calculateOtherFields = (record, aumIds, aumState, filters) => {
  const selectedAccountIds: number[] = find(filters.entities, x => true) || [];
  let aum;
  if (selectedAccountIds.length) {
    const aumFiltered = aumState.filter(a => selectedAccountIds.some(id => id === a.accountId));
    aum = aumFiltered.reduce((sum, el) => sum + el.aum, 0);
  } else {
    aum = aumState.reduce((sum, el) => sum + el.aum, 0);
  }
  const MVUSDLastPct = (record.MVUSDLast / aum) * 100;
  const MVUSDPct = (record.MVUSD / aum) * 100;
  const LMVUSD = record.Direction.toLowerCase() !== 'short' ? record.MVUSD : 0;
  const LMVUSDPCT = (LMVUSD / aum) * 100;
  const SMVUSD = record.Direction.toLowerCase() === 'short' ? record.MVUSD : 0;
  const SMVUSDPCT = (SMVUSD / aum) * 100;
  const DeltaAdjMVPct = (record.DeltaAdjExposure / aum) * 100;
  const pnlTotal = record.pnlRealized + record.pnlUnRealized;
  const pnlTotalPct = (record.pnlTotal / aum) * 100;

  return {
    ...record,
    MVUSDLastPct,
    MVUSDPct,
    LMVUSD,
    LMVUSDPCT,
    SMVUSD,
    SMVUSDPCT,
    DeltaAdjMVPct,
    pnlTotal,
    pnlTotalPct
  };
};

export const calculateObjectFieldsWithFormulas = (record: any, accIds: number[], allColumns: any[], aumState: {
  accountId?: number;
  aum?: number;
  date?: Date;
}[], filters) => {
  for (const column of allColumns) {
    if (column.type === 'calculation' && column.formula != null) {
      try {
        let recordCopy = { ...record };
        /*
        * Customization
        * */
        // If asset type === BOND we should not use multiplier in calculation column Delta Adjustment Position
        if (recordCopy.AssetType === 'BOND' && column.name === 'DeltaAdjPosition') {
          recordCopy.Multiplier = 1;
        }

        recordCopy = recalculateRecordWithColumnFormula(recordCopy, Array.from(accIds), column, aumState);
        record = {
          ...recordCopy,
          Multiplier: record.Multiplier
        };
      } catch (e) {
        console.log('Something went wrong during calculations', e);
      }
    }
  }
  return calculateOtherFields(record, accIds, aumState, filters);
};
