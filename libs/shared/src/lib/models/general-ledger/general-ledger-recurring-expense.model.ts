import { GeneralLedgerAccount } from '@pnkl-frontend/shared';


export class GeneralLedgerExpenseSchedule {
    constructor(public Frequency: string, public StartDate: Date, public EndDate: Date) {

    }
}


export class GeneralLedgerRecurringExpense {

    constructor(public Id: number, public GeneralLedgerAccount: GeneralLedgerAccount, public Factor: number, public Exposure: string, public Schedule: GeneralLedgerExpenseSchedule) {
        
    }

}