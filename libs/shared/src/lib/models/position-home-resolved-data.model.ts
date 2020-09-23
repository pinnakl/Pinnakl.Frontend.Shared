import { Account } from '../models/account.model';
import { Broker } from '../models/oms/broker/broker.model';
import { Security } from '../models/security/security.model';

export class PositionHomeResolvedData {
  constructor(
    public accounts: Account[],
    public brokers: Broker[],
    public funds: any,
    public securities: Security[]
  ) {}
}
