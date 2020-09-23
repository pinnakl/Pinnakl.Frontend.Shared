import { BrokerCommunicationTypes } from '../broker/broker-communication-types.model';

export class BrokerContact {
  constructor(
    public id: number,
    public brokerId: number,
    public communicationType: BrokerCommunicationTypes,
    public communicationAddress: string
  ) {}
}
