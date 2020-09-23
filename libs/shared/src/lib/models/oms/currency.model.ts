export class CurrencyForOMS {
  constructor(public id: number, public currency: string) {}
}

export class CurrencyForOMSFromApi {
  constructor(public id: string, public currency: string) {}
}
