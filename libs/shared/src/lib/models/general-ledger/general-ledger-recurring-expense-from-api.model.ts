export class GeneralLedgerRecurringExpenseFromApi {
    constructor(public id: string, public glaccountid: string, public accountmnemonic: string, public accountcategory: string, 
        public factor: string, public exposure: string, public frequency: string, public startdate: string, public enddate: string ) {

    }
}