export interface PnlDashboardWidget {
  fieldId: number;
  fieldName: string;
  widgetData: { fieldValue: string; pnl: number }[];
}
