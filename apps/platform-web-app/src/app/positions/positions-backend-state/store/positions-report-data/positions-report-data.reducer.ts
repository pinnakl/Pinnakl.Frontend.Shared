import { Action, createReducer, on } from '@ngrx/store';
import { findLast } from 'lodash';

import {
  AddManyPositionsReportData,
  AddPositionsReportData,
  AttemptLoadPositionsReportData,
  LoadPositionsReportData,
  LoadPositionsReportDataFailed,
  UpdateManyPositionsReportData,
  UpdateManyPriceReportData,
  UpdatePositionsReportData
} from './positions-report-data.actions';

export interface State {
  loaded: boolean;
  loading: boolean;
  reportData: any[];
}

export const initialState: State = {
  loaded: false,
  loading: false,
  reportData: []
};

const featureReducer = createReducer(
  initialState,
  on(AddManyPositionsReportData, (state, { reportDataToAdd }) => ({
    ...state,
    reportData: [...state.reportData, ...reportDataToAdd]
  })),
  on(AddPositionsReportData, (state, { reportDataToAdd }) => ({
    ...state,
    reportData: [...state.reportData, reportDataToAdd]
  })),
  on(AttemptLoadPositionsReportData, (state) => ({ ...state, loading: true, loaded: false })),
  on(LoadPositionsReportData, (state, { positionsReportData }) => ({
    ...state,
    loading: false,
    loaded: true,
    reportData: positionsReportData.map(data => {
      const existedData = state.reportData.find(r => r.AccountId === data.AccountId && r.SecurityId === data.SecurityId);
      return {
        ...data,
        Mark: data?.Mark || existedData?.Mark || 0,
        Delta: data?.Delta || existedData?.Delta || undefined
      };
    })
  })),
  on(LoadPositionsReportDataFailed, (state) => ({
    ...state, loading: false, loaded: false
  })),
  on(UpdateManyPositionsReportData, (state, { reportDataToUpdate }) => getUpdatedState(state, reportDataToUpdate)),
  on(UpdateManyPriceReportData, (state, { reportDataToUpdate }) => ({
    ...state,
    reportData: [...reportDataToUpdate]
  })),
  on(UpdatePositionsReportData, (state, { reportDataToUpdate }) => getUpdatedPositionsReportDataState(state, reportDataToUpdate))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

function getUpdatedPositionsReportDataState(state: State, reportDataForUpdate: any): State {
  let reportDataToReplace = null;
  if (reportDataForUpdate.AccountId != null) {
    reportDataToReplace = state.reportData.find(
      data =>
        data.AccountId === reportDataForUpdate.AccountId &&
        data.CustomAttributeId === reportDataForUpdate.CustomAttributeId &&
        data.SecurityId === reportDataForUpdate.SecurityId
    );
  }
  if (reportDataForUpdate.AccountCode != null && reportDataToReplace == null) {
    reportDataToReplace = state.reportData.find(
      data =>
        data.AccountCode === reportDataForUpdate.AccountCode &&
        data.CustomAttributeId === reportDataForUpdate.CustomAttributeId &&
        data.SecurityId === reportDataForUpdate.SecurityId
    );
  }
  if (reportDataToReplace != null) {
    const dataToUpdate = { ...reportDataForUpdate };
    if (dataToUpdate.rebalanceAdjBPS != null) {
      dataToUpdate.rebalanceAdjPct = reportDataToReplace.MVUSDLastPct +
        dataToUpdate.rebalanceAdjBPS / 100;
    }
    if (dataToUpdate.tradeQuantity !== null) {
      dataToUpdate.tradeCost = dataToUpdate.tradeQuantity * reportDataToReplace.PriceLast;
    }
    return {
      ...state,
      reportData: state.reportData.map(
        data => {
          let updatedValues = {};
          if (
            data.AccountId === reportDataForUpdate.AccountId &&
            data.CustomAttributeId ===
            reportDataForUpdate.CustomAttributeId &&
            data.SecurityId === reportDataForUpdate.SecurityId
          ) {
            updatedValues = {
              ...dataToUpdate
            };
          }
          return {
            ...data,
            ...updatedValues
          };
        })
    };
  }

  let savedSecId = null;
  let savedMVLastPct = null;
  let savedMVLastPctUpdatedAt = null;
  const MVUSDLastPctMap = new Map();

  state.reportData.forEach(item => {
    if (savedSecId == null) {
      savedSecId = item.SecurityId;
      savedMVLastPct = item.MVUSDLastPct;
      savedMVLastPctUpdatedAt = item.UpdatedAt;
    }
    if (item.SecurityId !== savedSecId) {
      MVUSDLastPctMap.set(savedSecId, savedMVLastPct);
      savedSecId = item.SecurityId;
      savedMVLastPct = item.MVUSDLastPct;
      savedMVLastPctUpdatedAt = item.UpdatedAt;
    } else {
      savedMVLastPct = item.MVUSDLastPct;
      savedMVLastPctUpdatedAt = item.UpdatedAt;
    }
  });
  MVUSDLastPctMap.set(savedSecId, savedMVLastPct);

  const updatedReportData = state.reportData.map(data => {
    if (!(
      data.CustomAttributeId === reportDataForUpdate.CustomAttributeId &&
      data.SecurityId === reportDataForUpdate.SecurityId
    )) {
      return { ...data };
    }
    const dataToUpdate = { ...reportDataForUpdate };
    if (reportDataForUpdate.rebalanceAdjBPS != null) {
      dataToUpdate.rebalanceAdjPct = MVUSDLastPctMap.get(data.SecurityId) +
        reportDataForUpdate.rebalanceAdjBPS / 100;
    }
    return {
      ...data,
      ...dataToUpdate,
      AccountId: data.AccountId
    };
  });

  return {
    ...state,
    reportData: [
      ...updatedReportData
    ]
  };
}

function getUpdatedState(stateCopy: State, reportDataForUpdate: any[]): State {
  const updatedEntities = stateCopy.reportData.map(existingEntity => {
    const updatedEntity = findLast(
      reportDataForUpdate,
      data =>
        data.AccountId === existingEntity.AccountId &&
        data.CustomAttributeId === existingEntity.CustomAttributeId &&
        data.SecurityId === existingEntity.SecurityId
    );
    if (!updatedEntity) {
      // If we don't receive security from stream but have it in report data
      // we should remove it from report data
      return null;
    }

    return { ...existingEntity, ...updatedEntity, Cost: existingEntity.AssetType === 'CASH' ? 1 : updatedEntity.Cost };
  });
  return { ...stateCopy, reportData: updatedEntities.filter(entity => entity != null) };
}

export const selectAll = (state: State) => state.reportData;
export const selectLoaded = (state: State) => state.loaded;
