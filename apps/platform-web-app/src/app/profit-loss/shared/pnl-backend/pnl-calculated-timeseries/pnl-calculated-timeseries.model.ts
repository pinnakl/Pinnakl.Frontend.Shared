interface PnlCalculatedTimeseriesPartial {
  date: Date;
}

export type PnlCalculatedTimeseries = PnlCalculatedTimeseriesPartial & {
  [key: string]: number;
};
