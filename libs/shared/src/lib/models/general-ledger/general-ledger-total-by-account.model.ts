export class GeneralLedgerTotalByAccount {
    constructor(public accountMnemonic: string, public accountCategory: string, public startingBalance: number, public change: number, public endingBalance: number) {
    }
  }