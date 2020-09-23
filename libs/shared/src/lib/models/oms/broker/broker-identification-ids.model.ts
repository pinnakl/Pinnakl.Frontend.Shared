import { BrokerIdentificationType } from './broker-identification-type.model';

export class BrokerIdentificationIds {
  public brokerIdentificationType: BrokerIdentificationType;
  constructor(
    public id: number,
    public brokerId: number,
    public brokerIdentificationTypeId: number,
    public brokerIdentifier: string
  ) {}
}

export class BrokerIdentificationIdsFromApi {
  constructor(
    public id: string,
    public brokerid: string,
    public brokeridentificationid: string,
    public brokeridentifier: string
  ) {}
}
