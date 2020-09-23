export class Price {
  constructor(
    public ask: string,
    public bid: string,
    public entryMethod: string,
    public evalTime: string,
    public id: string,
    public include: boolean,
    public mid: number,
    public priceDate: Date,
    public securityId: string,
    public source: string,
    public sourceName: string
  ) {}
}

export class PricingSource {
  constructor(
    public exclusive: boolean,
    public fileLoad: string,
    public id: string,
    public manuallyInsertable: boolean,
    public name: string
  ) {}
}

export class Position {
  constructor(
    public assetType: string,
    public change: number,
    public comment: string,
    public commentId: string,
    public description: string,
    public identifier: string,
    public mid: number,
    public prevMid: number,
    public priceType: string,
    public securityId: string,
    public ticker: string
  ) {}
}

export class PositionNew {
  constructor(
    public assetType: string,
    public change: number,
    public comment: string,
    public commentId: string,
    public description: string,
    public identifier: string,
    public mid: number,
    public prevMid: number,
    public priceType: string,
    public securityId: string,
    public ticker: string,
    public prices: Price[],
    public priceSource: string
  ) {}
}

export class PricingComment {
  constructor(
    public id: string,
    public priceDate: Date,
    public securityId: string,
    public comment: string
  ) {}
}
