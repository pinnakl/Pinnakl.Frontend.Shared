import { Action, createReducer, on } from '@ngrx/store';
import { getMultiplierByAssetType } from '@pnkl-frontend/shared';

import { PriceStreamModel } from '../../../../../positions/positions-backend/real-time/price-stream/price-stream.model';
import { PnlCalculatedAttribute } from '../../../pnl-backend/pnl-calculated-attribute/pnl-calculated-attribute.model';
import {
  AttemptLoadPnlCalculatedAttributes,
  LoadPnlCalculatedAttributes,
  LoadPnlCalculatedAttributesFailed,
  UpdateManyPnlCalculatedAttributes,
  UpdateManyPricesPnlCalculatedAttributes
} from './pnl-calculated-attribute.actions';

export interface State {
  loaded: boolean;
  loading: boolean;
  pnlCalculatedAttributes: PnlCalculatedAttribute[];
}

export const initialState: State = {
  loaded: false,
  loading: false,
  pnlCalculatedAttributes: []
};

const featureReducer = createReducer(
  initialState,
  on(AttemptLoadPnlCalculatedAttributes, (state) => ({
    ...state,
    loaded: false,
    loading: true
  })),
  on(LoadPnlCalculatedAttributes, (state, { pnlCalculatedAttributes }) => ({
    ...state,
    loaded: true,
    loading: false,
    pnlCalculatedAttributes
  })),
  on(LoadPnlCalculatedAttributesFailed, (state) => ({
    ...state,
    loaded: false,
    loading: false
  })),
  on(UpdateManyPnlCalculatedAttributes, (state, { pnlCalculatedAttributes }) =>
    getUpdatedState({ ...state }, pnlCalculatedAttributes)),
  on(UpdateManyPricesPnlCalculatedAttributes, (state, { pnlCalculatedAttributes }) =>
    getUpdatedPriceState(
      { ...state },
      pnlCalculatedAttributes
    ))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

function getUpdatedPriceState(stateCopy: State, pnlDataForUpdate: PriceStreamModel[]): State {
  const updatedEntities = stateCopy.pnlCalculatedAttributes.map(existingEntity => {
    pnlDataForUpdate.forEach(dataToUpdate => {
      if (existingEntity.securityId === dataToUpdate.securityId && dataToUpdate.priceType === 'mid') {
        existingEntity = {
          ...calculateFields({ ...existingEntity }, dataToUpdate.value - existingEntity.price),
          mark: dataToUpdate.value
        };
      }
    });

    return existingEntity;
  });
  return { ...stateCopy, pnlCalculatedAttributes: updatedEntities };
}

function getUpdatedState(
  stateCopy: State,
  pnlDataForUpdate: Partial<PnlCalculatedAttribute>[]
): State {
  const updatedEntities = stateCopy.pnlCalculatedAttributes.map(
    (existingEntity): PnlCalculatedAttribute => {
      const updatedEntity = pnlDataForUpdate.find(
        data =>
          data.attributeId === existingEntity.attributeId &&
          data.securityId === existingEntity.securityId
      );

      if (!updatedEntity) {
        return existingEntity;
      }

      if (existingEntity.mark == null) {
        return {
          ...existingEntity,
          ...updatedEntity,
          unrealizedPnl: 0,
          totalPnl: 0
        };
      }

      existingEntity = calculateFields({ ...existingEntity }, +existingEntity.mark - updatedEntity.price);
      return {
        ...existingEntity,
        ...updatedEntity,
        unrealizedPnl: existingEntity.unrealizedPnl,
        totalPnl: existingEntity.totalPnl
      };
    }
  );

  return { ...stateCopy, pnlCalculatedAttributes: updatedEntities };
}

function calculateFields(initialObj: any, priceChange: number): any {
  initialObj.unrealizedPnl =
    initialObj.position * priceChange * getMultiplierByAssetType(initialObj.assetType);
  initialObj.totalPnl = initialObj.unrealizedPnl + initialObj.realizedPnl;
  return initialObj;
}

export const selectAll = (state: State) => state.pnlCalculatedAttributes;
export const selectLoaded = (state: State) => state.loaded;
