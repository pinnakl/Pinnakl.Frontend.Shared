export class JournalItemFromApi {
    constructor(
      public id: string,
      public date: string,
      public glaccountid: string,
      public accountcategory: string,
      public accountmnemonic: string,
      public accountdescription: string,
      public amount: string,
      public description: string
    ) {}
  }