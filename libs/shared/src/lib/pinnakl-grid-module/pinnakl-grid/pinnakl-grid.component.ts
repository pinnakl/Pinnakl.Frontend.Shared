import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import {
  ColumnApi,
  ColumnRowGroupChangedEvent,
  DragStoppedEvent,
  GridApi,
  GridOptions,
  ModelUpdatedEvent,
  SortChangedEvent
} from 'ag-grid-community';

import { PinnaklColDef } from '../pinnakl-col-def.model';

@Component({
  selector: 'pinnakl-grid',
  templateUrl: './pinnakl-grid.component.html'
})
export class PinnaklGridComponent {
  @Input() autoGroupColumnDef: any;
  @Input() columnDefs: PinnaklColDef[];
  @Input() gridHeight: string;
  @Input() gridOptions: GridOptions;
  @Input() groupIncludeFooter: boolean;
  @Input() groupMultiAutoColumn: boolean;
  @Input() headerHeight: number;
  @Input() leftOverSpaceRatioThreshold = 0.35;
  @Input() pinnedBottomRowData: any[];
  @Input() rowData: any[];
  @Input() rowGroupPanelShow: string;
  @Input() rowHeight: number;
  @Input() rowSelection: string;
  @Input() searchText = '';
  @Input() styleClass: string;

  @Output() private columnMoved = new EventEmitter<
    { name: string; viewOrder: number }[]
  >();
  @Output() private groupChanged = new EventEmitter<
    { name: string; groupOrder: number }[]
  >();
  @Output() private sortChanged = new EventEmitter<
    { name: string; sortAscending: boolean; sortOrder: number }[]
  >();
  @Output() rowClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowSelectionChanged: EventEmitter<any> = new EventEmitter<any>();

  private readonly agGridPanelClass = 'ag-root-wrapper-body';
  private bodyScrollTriggerTime: Date;
  private gridApi: GridApi;
  private gridColumnApi: ColumnApi;

  constructor(private grid: ElementRef) {}

  bodyScrollHandler(): void {
    this.bodyScrollTriggerTime = new Date();
  }

  columnMovedHandler({ api, columnApi }: DragStoppedEvent): void {
    const newViewOrders = columnApi.getColumnState().map(({ colId }, i) => ({
      name: colId.replace('_1', ''),
      viewOrder: i + 1
    }));
    this.columnMoved.emit(newViewOrders);
  }

  selectionChanged(): void {
    this.rowSelectionChanged.emit();
  }

  // this is used to handle group collapse/expand or "expand/collapse all" events
  // rowGroupOpened is not prefered as it doesn't work for "expand/collapse all"
  modelUpdateHandler(event: ModelUpdatedEvent): void {
    if (!event.newData) {
      this.customResizeColumns();
    }
  }

  onGridReady(): void {
    this.gridApi = this.gridOptions.api;
    this.gridColumnApi = this.gridOptions.columnApi;
    this.gridApi.expandAll();
  }

  onRowDataChange(): void {
    if (!this.gridApi) {
      return;
    }
    this.gridApi.resetRowHeights();
  }

  onRowClicked(event: any): void {
    this.rowClicked.emit(event);
  }

  sortHandler({ api }: SortChangedEvent): void {
    const newSortOrders = api
      .getSortModel()
      .map(({ colId: name, sort }, i) => ({
        name,
        sortAscending: sort === 'asc',
        sortOrder: i + 1
      }));
    this.sortChanged.emit(newSortOrders);
    this.customResizeColumns();
    this.gridApi.resetRowHeights();
  }

  sortGroupsAndSetVisibility(event: ColumnRowGroupChangedEvent): void {
    let { api, columnApi, columns: groupColumns } = event,
      allColumns = columnApi.getAllColumns();
    const newGroupOrders = groupColumns.map((c, i) => ({
      name: c.getColId(),
      groupOrder: i + 1
    }));
    this.groupChanged.emit(newGroupOrders);
    columnApi.setColumnsVisible(allColumns, true);
    columnApi.setColumnsVisible(groupColumns, false);
    // if (groupColumns.length > 0) {
    //   let allDisplayedColumns = columnApi.getAllDisplayedColumns(),
    //     displayedGroupColumns = groupColumns.map(gc =>
    //       allDisplayedColumns
    //         .find(
    //           col => col.isVisible() && col.getColId().includes(gc.getColId())
    //         )
    //         .getColId()
    //     ),
    //     sortStates = api.getSortModel();
    //   displayedGroupColumns.reverse();
    //   displayedGroupColumns.forEach(col =>
    //     sortStates.unshift({ colId: col, sort: 'asc' })
    //   );
    //   api.setSortModel(sortStates);
    // }
    api.expandAll();
  }

  viewPortChangedHandler(): void {
    if (!this.bodyScrollTriggerTime) {
      this.customResizeColumns();
    } else if (
      // check if viewportchange was triggered because of scrolling
      new Date().getTime() - this.bodyScrollTriggerTime.getTime() >
      500
    ) {
      this.customResizeColumns();
    }
  }

  private customResizeColumns(): void {
    if (!this.gridApi || !this.gridColumnApi) {
      return;
    }
    const allColumnIds = this.gridColumnApi
      .getAllDisplayedColumns()
      .map(column => column.getColId());
    this.gridColumnApi.autoSizeColumns(allColumnIds);
    // let numLongTextColumns = 0;
    // this.columnDefs.forEach(cd => {
    //   if (cd.customType && cd.customType.toLowerCase() === 'longtext') {
    //     numLongTextColumns++;
    //     this.gridColumnApi.setColumnWidth(cd.field, cd.width);
    //   }
    // });
    // const columnWidthMapping: { [key: string]: number } = {};
    // // columns with specified maxWidth can cause problems, need to handle it
    // // this is sum of widths of all columns with maxWidth property
    // let spaceToIgnore = 0;
    // this.gridColumnApi.getAllDisplayedColumns().forEach(column => {
    //   if (!column.getMaxWidth()) {
    //     columnWidthMapping[column.getColId()] = column.getActualWidth();
    //   } else {
    //     spaceToIgnore += column.getActualWidth();
    //   }
    // });
    // if (!Object.keys(columnWidthMapping).length) {
    //   return;
    // }
    // const columnsWidth = (<any>Object)
    //   .values(columnWidthMapping)
    //   .reduce((sumWidth, width) => sumWidth + width);
    // // viewportWrapper may not work, if class is changed in the ag-grid update (using v18 currently)
    // const viewportWrapper = <HTMLElement>(
    //   (<HTMLElement>this.grid.nativeElement).getElementsByClassName(
    //     this.agGridPanelClass
    //   )[0].children[0]
    // );
    // // in case element not found, maybe class has changed in new version of ag-grid
    // if (!viewportWrapper) {
    //   return;
    // }
    // const gridWidth = viewportWrapper.offsetWidth;
    // // check if horizontal scrollbar exists
    // if (columnsWidth > gridWidth) {
    //   return;
    // }
    // const leftOverSpace = gridWidth - columnsWidth - spaceToIgnore;
    // // don't remove this! if something goes wrong, columns should not shrink
    // if (leftOverSpace < 0) {
    //   return;
    // }
    // if (numLongTextColumns) {
    //   const spaceAvailablePerLongTextColumn =
    //     leftOverSpace / numLongTextColumns;
    //   this.columnDefs.forEach(cd => {
    //     if (cd.customType === 'LongText') {
    //       this.gridColumnApi.setColumnWidth(
    //         cd.field,
    //         columnWidthMapping[cd.field] + spaceAvailablePerLongTextColumn
    //       );
    //     }
    //   });
    // } else {
    //   // Don't resize if there are very few columns
    //   const leftOverSpaceRatio = leftOverSpace / gridWidth;
    //   if (leftOverSpaceRatio > this.leftOverSpaceRatioThreshold) {
    //     return;
    //   }
    //   const spaceAvailablePerColumn =
    //     leftOverSpace / Object.keys(columnWidthMapping).length;
    //   Object.keys(columnWidthMapping).forEach(colId =>
    //     this.gridColumnApi.setColumnWidth(
    //       colId,
    //       columnWidthMapping[colId] + spaceAvailablePerColumn
    //     )
    //   );
    // }
  }

  // uses internal private methods of ag-grid => not recommended
  // to make this work, remove GridApi type from gridApi
  // private customResizeColumns(): void {
  //   if (!this.gridApi || !this.gridColumnApi) {
  //     return;
  //   }
  //   const allColumnIds = this.gridColumnApi
  //     .getAllDisplayedColumns()
  //     .map(column => column.getColId());
  //   this.gridColumnApi.autoSizeColumns(allColumnIds);
  //   let numLongTextColumns = 0;
  //   this.columnDefs.forEach(cd => {
  //     if (cd.customType === 'LongText') {
  //       numLongTextColumns++;
  //       this.gridColumnApi.setColumnWidth(cd.field, cd.width);
  //     }
  //   });
  //   const columnWidthMapping: { [key: string]: number } = {};
  //   let spaceToIgnore = 0; // columns with specified maxWidth can cause problems, need to handle it
  //   this.gridColumnApi.getAllDisplayedColumns().forEach(column => {
  //     if (!column.getMaxWidth()) {
  //       columnWidthMapping[column.getColId()] = column.getActualWidth();
  //     } else {
  //       spaceToIgnore += column.getActualWidth();
  //     }
  //   });
  //   if (!Object.keys(columnWidthMapping).length) {
  //     return;
  //   }
  //   const currentTotalWidth = (<any>Object)
  //     .values(columnWidthMapping)
  //     .reduce((sumWidth, width) => sumWidth + width);
  //   // check if horizontal scrollbar exists
  //   if (this.gridApi.gridPanel.isHorizontalScrollShowing()) {
  //     return;
  //   }
  //   const gridViewPort = this.gridApi.gridPanel.eFullWidthViewportWrapper;
  //   // in case internal property name changed
  //   if (!gridViewPort) {
  //     return;
  //   }
  //   const leftOverSpace =
  //     gridViewPort.clientWidth - currentTotalWidth - spaceToIgnore;
  //   // don't remove this! if something goes wrong, columns should not shrink
  //   if (leftOverSpace < 0) {
  //     return;
  //   }
  //   if (numLongTextColumns) {
  //     const spaceAvailablePerLongTextColumn =
  //       leftOverSpace / numLongTextColumns;
  //     this.columnDefs.forEach(cd => {
  //       if (cd.customType === 'LongText') {
  //         this.gridColumnApi.setColumnWidth(
  //           cd.field,
  //           columnWidthMapping[cd.field] + spaceAvailablePerLongTextColumn
  //         );
  //       }
  //     });
  //   } else {
  //     const spaceAvailablePerColumn =
  //       leftOverSpace / Object.keys(columnWidthMapping).length;
  //     Object.keys(columnWidthMapping).forEach(colId =>
  //       this.gridColumnApi.setColumnWidth(
  //         colId,
  //         columnWidthMapping[colId] + spaceAvailablePerColumn
  //       )
  //     );
  //   }
  // }
}
