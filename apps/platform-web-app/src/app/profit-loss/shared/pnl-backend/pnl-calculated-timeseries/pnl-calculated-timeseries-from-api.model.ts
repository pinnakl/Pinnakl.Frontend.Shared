interface PnlCalculatedTimeseriesFromApiPartial {
  date: string;
}

export type PnlCalculatedTimeseriesFromApi = PnlCalculatedTimeseriesFromApiPartial & {
  [key: string]: string;
};
