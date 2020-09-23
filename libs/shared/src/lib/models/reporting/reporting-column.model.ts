export class ReportingColumn {
  public caption: string;
  public convertToBaseCurrency: boolean;
  public dbId: number;
  public decimalPlaces: number;
  public filters: number | Date | string[];
  public groupOrder: number;
  public include: boolean;
  public isAggregating: boolean;
  public name: string;
  public renderingFunction: string;
  public reportingColumnType: 'ca' | 'idc' | 'report';
  public sortAscending: boolean;
  public sortOrder: number;
  public type: string;
  public formula: string;
  public viewOrder: number;
}
