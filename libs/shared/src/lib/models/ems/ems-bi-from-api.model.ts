interface EMSBIDataFromApiPartial {
  date: string;
}

export type EMSBIDataFromApi = EMSBIDataFromApiPartial & {
  [key: string]: string;
};
