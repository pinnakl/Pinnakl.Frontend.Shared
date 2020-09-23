import { GeneralLedgerAccount } from './general-ledger-account.model';

export class JournalItem {
    constructor(public postingDate: Date, public amount: Number, public description: string, public glAccount: GeneralLedgerAccount){    
    }
  }
  