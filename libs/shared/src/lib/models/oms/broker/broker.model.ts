export enum BrokerEnvironmentType {
  UAT = 'UAT',
  PROD = 'PROD'
}

export class Broker {
  public showAlgo: boolean;
  constructor(
    public id: number,
    public brokerCode: string,
    public brokerName: string,
    public sendAllocations: boolean,
    public clearingIndicator: boolean,
    public clearingBrokerId: number,
    public nsccCode: string,
    public fixNetBrokerCode: string,
    public environment: BrokerEnvironmentType
  ) {}
}

export class BrokerFromApi {
  constructor(
    public id: string,
    public brokercode: string,
    public brokername: string,
    public sendallocations: string,
    public clearing_indicator: string,
    public clearingbrokerid: string,
    public nscccode: string,
    public fixnetbrokercode: string,
    public environment: BrokerEnvironmentType,
    public showalgo: string
  ) {}
}
