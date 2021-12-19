import { Action, createReducer, on } from '@ngrx/store';
import { ReportingColumn } from '@pnkl-frontend/shared';
import {
  AddPositionsReportSaveSelectedColumns,
  DeletePositionsReportSaveSelectedColumns,
  LoadPositionsReportSaveSelectedColumns,
  UpdatePositionsReportSaveSelectedColumns
} from './positions-report-save-selected-column.actions';

export interface State {
  entities: ReportingColumn[];
}

export const initialState: State = {
  entities: []
};

const featureReducer = createReducer(
  initialState,
  on(AddPositionsReportSaveSelectedColumns, (state, { positionsReportSelectedColumns }) => {
    let maxViewOrder = Math.max(...state.entities.map(entity => entity.viewOrder)) || 0;
    const columnsToAdd: ReportingColumn[] = JSON.parse(JSON.stringify(positionsReportSelectedColumns));
    columnsToAdd.forEach(c => c.viewOrder = ++maxViewOrder);

    return {
      entities: [
        ...state.entities,
        ...columnsToAdd
      ].sort((a, b) => (a.viewOrder || 999) - (b.viewOrder || 999))
    };
  }),
  on(DeletePositionsReportSaveSelectedColumns, (state, { payload }) => {
    const {
      positionsReportSelectedColumns: columnsToRemove
    } = payload;
    return {
      entities: state.entities.filter(
        existingEntity =>
          !columnsToRemove.some(
            columnToRemove =>
              columnToRemove.name === existingEntity.name &&
              columnToRemove.reportingColumnType ===
              existingEntity.reportingColumnType
          )
      )
    };
  }),
  on(LoadPositionsReportSaveSelectedColumns, (_, { positionsReportSelectedColumns }) => ({ entities: positionsReportSelectedColumns })),
  on(UpdatePositionsReportSaveSelectedColumns, (state, { positionsReportSelectedColumns }) => {
    const updatedEntities = state.entities.map(existingEntity => {
      const updatedEntity = positionsReportSelectedColumns.find(
        reportingColumn =>
          reportingColumn.name === existingEntity.name &&
          reportingColumn.reportingColumnType ===
          existingEntity.reportingColumnType
      );
      if (!updatedEntity) {
        return existingEntity;
      }
      return { ...existingEntity, ...updatedEntity };
    });
    return {
      entities: updatedEntities
    };
  })
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const selectEntities = (state: State) => state.entities;
