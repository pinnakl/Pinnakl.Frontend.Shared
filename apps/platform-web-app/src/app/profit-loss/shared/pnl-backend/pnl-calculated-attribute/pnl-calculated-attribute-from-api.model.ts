interface PnlCalculatedAttributeFromApiPartial {
  attributeid: string;
  realizedpnl: string;
  securityid: string;
  totalpnl: string;
  unrealizedpnl: string;
}

export type PnlCalculatedAttributeFromApi = PnlCalculatedAttributeFromApiPartial & {
  [key: string]: string;
};
