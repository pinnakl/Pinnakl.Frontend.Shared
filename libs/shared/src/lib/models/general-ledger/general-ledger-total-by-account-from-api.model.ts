export class GeneralLedgerTotalByAccountFromApi {
  constructor(public accountmnemonic: string, public accountcategory: string, public startingbalance: string, public change: string, public endingbalance: string) {
  }
}