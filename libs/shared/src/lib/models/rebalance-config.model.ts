export interface RebalanceConfigModelFromApi {
  bpspctvisible: string;
  equitycommassumption: string;
  id: string;
  optioncommassumption: string;
  equitybrokerid: string;
  optionbrokerid: string;
  pnkl_type: string;
}

export interface RebalanceConfigModel {
  BPSPctVisible: boolean;
  EquityCommAssumption: number;
  OptionCommAssumption: number;
  id?: string;
  EquityBrokerId: number;
  OptionBrokerId: number;
  pnkl_type?: string;
}
