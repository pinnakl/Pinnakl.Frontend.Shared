import { Injectable } from '@angular/core';

import { isEqual } from 'lodash';

import { UserService } from '@pnkl-frontend/core';
import {
  ClientReportColumn,
  ReportingColumn,
  UserReport,
  UserReportColumn, UserReportColumnService,
  UserReportCustomAttribute, UserReportCustomAttributeService,
  UserReportIdcColumn, UserReportIdcColumnService, UserReportService
} from '@pnkl-frontend/shared';

@Injectable()
export class PositionsReportSaveHelper {
  constructor(
    private readonly _userReportColumnService: UserReportColumnService,
    private readonly _userReportCustomAttributeService: UserReportCustomAttributeService,
    private readonly _userReportIdcColumnService: UserReportIdcColumnService,
    private readonly _userReportService: UserReportService,
    private readonly _userService: UserService
  ) {}

  async save({
    clientReportColumns,
    reportId,
    selectedColumns,
    userReportColumns,
    userReportIdcColumns,
    userReportCustomAttributes
  }: {
    clientReportColumns: ClientReportColumn[];
    reportId: number;
    selectedColumns: ReportingColumn[];
    userReportColumns: UserReportColumn[];
    userReportIdcColumns: UserReportIdcColumn[];
    userReportCustomAttributes: UserReportCustomAttribute[];
  }): Promise<{
    userReportColumns: UserReportColumn[];
    userReportCustomAttributes: UserReportCustomAttribute[];
    userReportIdcColumns: UserReportIdcColumn[];
  }> {
    if (userReportColumns.length) {
      return this._updateUserReport({
        selectedColumns,
        userReportColumns,
        userReportIdcColumns,
        userReportCustomAttributes
      });
    } else {
      return this._createUserReport({
        clientReportColumns,
        reportId,
        selectedColumns
      });
    }
  }

  private async _createUserReport({
    clientReportColumns,
    reportId,
    selectedColumns
  }: {
    clientReportColumns: ClientReportColumn[];
    reportId: number;
    selectedColumns: ReportingColumn[];
  }): Promise<{
    userReportColumns: UserReportColumn[];
    userReportCustomAttributes: UserReportCustomAttribute[];
    userReportIdcColumns: UserReportIdcColumn[];
  }> {
    const { id: userId } = this._userService.getUser();
    const clientReportId = clientReportColumns[0]?.clientReportId;
    const { id: userReportId } = await this._userReportService.postUserReport({
      clientReportId,
      isPnklInternal: true,
      reportName: 'postions_internal',
      reportId,
      userId
    } as UserReport);
    const [
      userReportColumns,
      userReportCustomAttributes,
      userReportIdcColumns
    ] = await Promise.all([
      this._postUserReportColumns(selectedColumns, userReportId),
      this._postUserReportCustomAttributes(selectedColumns, userReportId),
      this._postUserReportIdcColumns(selectedColumns, userReportId)
    ]);
    return {
      userReportColumns,
      userReportCustomAttributes,
      userReportIdcColumns
    };
  }

  private async _postUserReportColumns(
    selectedColumns: ReportingColumn[],
    userReportId: number
  ): Promise<UserReportColumn[]> {
    return this._postAnyUserReportColumns(
      _getUserReportColumnFromReportingColumn,
      this._userReportColumnService.postUserReportColumn.bind(
        this._userReportColumnService
      ),
      selectedColumns,
      userReportId,
      'report'
    );
  }

  private async _postUserReportCustomAttributes(
    selectedColumns: ReportingColumn[],
    userReportId: number
  ): Promise<UserReportCustomAttribute[]> {
    return this._postAnyUserReportColumns(
      _getUserReportCustomAttributeFromReportingColumn,
      this._userReportCustomAttributeService.postUserReportCustomAttribute.bind(
        this._userReportCustomAttributeService
      ),
      selectedColumns,
      userReportId,
      'ca'
    );
  }

  private async _postUserReportIdcColumns(
    selectedColumns: ReportingColumn[],
    userReportId: number
  ): Promise<UserReportIdcColumn[]> {
    return this._postAnyUserReportColumns(
      _getUserReportIdcColumnFromReportingColumn,
      this._userReportIdcColumnService.postUserReportIdcColumn.bind(
        this._userReportIdcColumnService
      ),
      selectedColumns,
      userReportId,
      'idc'
    );
  }

  private async _postAnyUserReportColumns<T>(
    formatFunction: (rc: ReportingColumn, userReportId: number) => T,
    postFunction: (cols: T) => Promise<T>,
    selectedColumns: ReportingColumn[],
    userReportId: number,
    reportingColumnType: 'ca' | 'idc' | 'report'
  ): Promise<T[]> {
    return Promise.all(
      selectedColumns
        .filter(col => col.reportingColumnType === reportingColumnType)
        .map(col => postFunction(formatFunction(col, userReportId)))
    );
  }

  private async _saveUserReportColumns({
    selectedColumns,
    userReportColumns,
    userReportId
  }: {
    selectedColumns: ReportingColumn[];
    userReportColumns: UserReportColumn[];
    userReportId: number;
  }): Promise<UserReportColumn[]> {
    return this._saveAnyUserReportColumns({
      deleteFunction: this._userReportColumnService.deleteUserReportColumn.bind(
        this._userReportColumnService
      ),
      postFormattingFunction: _getUserReportColumnFromReportingColumn,
      postFunction: this._userReportColumnService.postUserReportColumn.bind(
        this._userReportColumnService
      ),
      putFunction: this._userReportColumnService.putUserReportColumn.bind(
        this._userReportColumnService
      ),
      reportingColumnType: 'report',
      selectedColumns,
      userReportColumns,
      userReportId
    });
  }

  private async _saveUserReportCustomAttributes({
    selectedColumns,
    userReportCustomAttributes,
    userReportId
  }: {
    selectedColumns: ReportingColumn[];
    userReportCustomAttributes: UserReportCustomAttribute[];
    userReportId: number;
  }): Promise<UserReportCustomAttribute[]> {
    return this._saveAnyUserReportColumns({
      deleteFunction: this._userReportCustomAttributeService.deleteUserReportCustomAttribute.bind(
        this._userReportCustomAttributeService
      ),
      postFormattingFunction: _getUserReportCustomAttributeFromReportingColumn,
      postFunction: this._userReportCustomAttributeService.postUserReportCustomAttribute.bind(
        this._userReportCustomAttributeService
      ),
      putFunction: this._userReportCustomAttributeService.putUserReportCustomAttribute.bind(
        this._userReportCustomAttributeService
      ),
      reportingColumnType: 'ca',
      selectedColumns,
      userReportColumns: userReportCustomAttributes,
      userReportId
    });
  }

  private async _saveUserReportIdcColumns({
    selectedColumns,
    userReportIdcColumns,
    userReportId
  }: {
    selectedColumns: ReportingColumn[];
    userReportIdcColumns: UserReportIdcColumn[];
    userReportId: number;
  }): Promise<UserReportIdcColumn[]> {
    return this._saveAnyUserReportColumns({
      deleteFunction: this._userReportIdcColumnService.deleteUserReportIdcColumn.bind(
        this._userReportIdcColumnService
      ),
      postFormattingFunction: _getUserReportIdcColumnFromReportingColumn,
      postFunction: this._userReportIdcColumnService.postUserReportIdcColumn.bind(
        this._userReportIdcColumnService
      ),
      putFunction: this._userReportIdcColumnService.putUserReportIdcColumn.bind(
        this._userReportIdcColumnService
      ),
      reportingColumnType: 'idc',
      selectedColumns,
      userReportColumns: userReportIdcColumns,
      userReportId
    });
  }

  private async _saveAnyUserReportColumns<
    T extends {
      filterValues: Date | number | string[];
      groupOrder: number;
      id: number;
      isAggregating: boolean;
      name: string;
      sortAscending: boolean;
      sortOrder: number;
      userReportId: number;
      viewOrder: number;
    }
  >({
    deleteFunction,
    postFormattingFunction,
    postFunction,
    putFunction,
    reportingColumnType,
    selectedColumns,
    userReportColumns,
    userReportId
  }: {
    deleteFunction: (id: number) => Promise<void>;
    postFormattingFunction: (
      entity: ReportingColumn,
      userReportId: number
    ) => T;
    postFunction: (entity: T) => Promise<T>;
    putFunction: (entity: T) => Promise<T>;
    reportingColumnType: 'ca' | 'idc' | 'report';
    selectedColumns: ReportingColumn[];
    userReportColumns: T[];
    userReportId: number;
  }): Promise<T[]> {
    const selectedReportColumns = selectedColumns.filter(
      col => col.reportingColumnType === reportingColumnType
    );
    const toDelete = userReportColumns
      .filter(
        ({ name }) => !selectedReportColumns.some(src => src.name === name)
      )
      .map(({ id }) => id);
    const [
      createdUserReportColumns,
      updatedUserReportColumns
    ] = await Promise.all([
      Promise.all(
        selectedReportColumns
          .filter(
            ({ name }) => !userReportColumns.some(urc => urc.name === name)
          )
          .map(col => postFunction(postFormattingFunction(col, userReportId)))
      ),
      Promise.all(
        selectedReportColumns
          .reduce((columnsToUpdate, sc) => {
            const existingColumn = userReportColumns.find(
              urc => urc.name === sc.name
            );
            if (!existingColumn) {
              return columnsToUpdate;
            }
            const updatedColumn = _getAnyUpdatedUserReportColumn(
              sc,
              existingColumn
            );
            if (!updatedColumn) {
              return columnsToUpdate;
            }
            return [...columnsToUpdate, updatedColumn];
          }, [])
          .map(col => putFunction(col))
      ),
      Promise.all(toDelete.map(id => deleteFunction(id)))
    ]);
    const untouched = userReportColumns.filter(
      ({ id }) =>
        !toDelete.includes(id) &&
        !updatedUserReportColumns.some(uc => uc.id === id)
    );
    return [
      ...untouched,
      ...createdUserReportColumns,
      ...updatedUserReportColumns
    ];
  }

  private async _updateUserReport({
    selectedColumns,
    userReportColumns,
    userReportIdcColumns,
    userReportCustomAttributes
  }: {
    selectedColumns: ReportingColumn[];
    userReportColumns: UserReportColumn[];
    userReportIdcColumns: UserReportIdcColumn[];
    userReportCustomAttributes: UserReportCustomAttribute[];
  }): Promise<{
    userReportColumns: UserReportColumn[];
    userReportCustomAttributes: UserReportCustomAttribute[];
    userReportIdcColumns: UserReportIdcColumn[];
  }> {
    const { userReportId } = userReportColumns[0];
    const updatedUserReportColumns = await this._saveUserReportColumns({
      selectedColumns,
      userReportColumns,
      userReportId
    });
    const updatedUserReportCustomAttributes = await this._saveUserReportCustomAttributes(
      {
        selectedColumns,
        userReportCustomAttributes,
        userReportId
      }
    );
    const updatedUserReportIdcColumns = await this._saveUserReportIdcColumns({
      selectedColumns,
      userReportIdcColumns,
      userReportId
    });
    return {
      userReportColumns: updatedUserReportColumns,
      userReportCustomAttributes: updatedUserReportCustomAttributes,
      userReportIdcColumns: updatedUserReportIdcColumns
    };
  }
}

function _getAnyUpdatedUserReportColumn<
  T extends {
    filterValues: Date | number | string[];
    groupOrder: number;
    id: number;
    isAggregating: boolean;
    sortAscending: boolean;
    sortOrder: number;
    viewOrder: number;
  }
>(
  {
    filters,
    groupOrder,
    isAggregating,
    sortAscending,
    sortOrder,
    viewOrder
  }: ReportingColumn,
  existingEntity: T
): Partial<T> {
  const updatedEntity: Partial<T> = {};
  if (!isEqual(filters, existingEntity.filterValues)) {
    updatedEntity.filterValues = filters;
  }
  if (groupOrder !== existingEntity.groupOrder) {
    updatedEntity.groupOrder = groupOrder;
  }
  if (isAggregating !== existingEntity.isAggregating) {
    updatedEntity.isAggregating = isAggregating;
  }
  if (sortAscending !== existingEntity.sortAscending) {
    updatedEntity.sortAscending = sortAscending;
  }
  if (sortOrder !== existingEntity.sortOrder) {
    updatedEntity.sortOrder = sortOrder;
  }
  if (viewOrder !== existingEntity.viewOrder) {
    updatedEntity.viewOrder = viewOrder;
  }
  if (isEqual(updatedEntity, {})) {
    return null;
  }
  updatedEntity.id = existingEntity.id;
  return updatedEntity;
}

function _getUserReportColumnFromReportingColumn(
  {
    dbId: reportColumnId,
    filters: filterValues,
    groupOrder,
    isAggregating,
    renderingFunction,
    sortAscending,
    sortOrder,
    viewOrder
  }: ReportingColumn,
  userReportId: number
): UserReportColumn {
  return {
    filterValues,
    groupOrder,
    isAggregating,
    renderingFunction,
    reportColumnId,
    sortAscending,
    sortOrder,
    userReportId,
    viewOrder
  } as UserReportColumn;
}

function _getUserReportCustomAttributeFromReportingColumn(
  {
    dbId: customAttributeId,
    filters: filterValues,
    groupOrder,
    isAggregating,
    sortAscending,
    sortOrder,
    viewOrder
  }: ReportingColumn,
  userReportId: number
): UserReportCustomAttribute {
  return {
    customAttributeId,
    filterValues,
    groupOrder,
    isAggregating,
    sortAscending,
    sortOrder,
    userReportId,
    viewOrder
  } as UserReportCustomAttribute;
}

function _getUserReportIdcColumnFromReportingColumn(
  {
    dbId: idcColumnId,
    filters: filterValues,
    groupOrder,
    isAggregating,
    sortAscending,
    sortOrder,
    viewOrder
  }: ReportingColumn,
  userReportId: number
): UserReportIdcColumn {
  return {
    filterValues,
    groupOrder,
    idcColumnId,
    isAggregating,
    sortAscending,
    sortOrder,
    userReportId,
    viewOrder
  } as UserReportIdcColumn;
}
