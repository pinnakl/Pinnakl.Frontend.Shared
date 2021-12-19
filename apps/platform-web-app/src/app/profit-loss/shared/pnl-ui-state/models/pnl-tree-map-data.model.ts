export interface PnlTreeMapData {
  fieldId: number;
  fieldName: string;
  pnlData: (
    | {
        fieldValue: string;
        pnls: SecurityPnlInfo[];
      }
    | SecurityPnlInfo)[];
}

export interface SecurityPnlInfo {
  ticker: string;
  position: number;
  price: number;
  totalPnl: number;
}
