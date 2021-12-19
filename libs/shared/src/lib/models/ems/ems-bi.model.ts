interface EMSBIDataPartial {
  date: Date;
}

export type EMSBIData = EMSBIDataPartial & {
  [key: string]: number;
};
