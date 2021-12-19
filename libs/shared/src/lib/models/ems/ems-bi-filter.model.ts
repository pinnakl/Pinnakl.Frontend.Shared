export interface EMSBusinessIntelligenceFilter {
  field: string;
  endDate: Date;
  groupingKey: { name: string, type: string };
  dataType: DataTypes;
  startDate: Date;
  groupingField: string;
  valueType: DataTypes;
}

export const enum DataTypes {
  NET_MONEY = 'NetMoney',
  COMMISSION  = 'Commission'
}
