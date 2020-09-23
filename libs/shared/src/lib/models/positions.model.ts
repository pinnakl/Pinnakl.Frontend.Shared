export class Positions {
  constructor(
    public analyst: string,
    public assetType: string,
    public description: string,
    public folderCode: string,
    public localCurrency: string,
    public MVUSD: number,
    public MVUSDPct: number,
    public position: number,
    public cost: number,
    public sector: string,
    public securityId: number,
    public strategy: string,
    public ticker: string,
    public trader: string,
    public identifier: string
  ) {}
}
