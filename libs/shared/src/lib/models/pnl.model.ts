export class PnL {
  constructor(
    public id: number,
    public userinteractivedataid: number,
    public assettype: string,
    public ticker: string,
    public description: string,
    public quantity: number,
    public price: number,
    public daily_pnl: number,
    public mtd_pnl: number,
    public ytd_pnl: number,
    public primaryid: string,
    public id1: string,
    public id2: string,
    public id3: string,
    public pnklsecidforcashpnl: number,
    public securityid: number,
    public accountid: number,
    public folderid: number,
    public extfoldercode: string,
    public foldercode: string,
    public pnltype: string
  ) {}
}
