import { BrokerIdentificationTypes } from '../broker/broker-identification-types.model';

export class BrokerIdentificationType {
  displayString: string;
  constructor(
    public id: number,
    public idType: BrokerIdentificationTypes,
    public description: string,
    public orderOfImportance: number
  ) {
    this.displayString =
      BrokerIdentificationTypes[this.idType] + ' - ' + this.description;
  }
}

export class BrokerIdentificationTypeFromApi {
  constructor(
    public id: string,
    public type: string,
    public description: string,
    public orderofimportance: string
  ) {}
}
