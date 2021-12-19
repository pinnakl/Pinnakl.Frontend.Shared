// Angular
import { Injectable } from '@angular/core';

// Models
import { getBooleanFromString, WebServiceProvider } from '@pnkl-frontend/core';
import { map } from 'rxjs/operators';
import { BrokerIdentificationTypes } from '../models';
import { Broker } from '../models';
import { BrokerFromApi } from '../models';
import { BrokerContact } from '../models';
import { BrokerEnvironmentType, BrokerIdentificationIds } from '../models';
import { BrokerIdentificationIdsFromApi } from '../models';
import { BrokerIdentificationType } from '../models';
import { BrokerIdentificationTypeFromApi } from '../models';

// Services
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BrokerService {
  private readonly _brokersEndpoint = 'entities/brokers';
  private readonly _brokerEmailsEndpoint = 'entities/broker_emails';
  private readonly _brokerIdentificationIdEndpoint =
    'entities/broker_identification_Id';
  private readonly _brokerIdentificationTypesEndpoint =
    'entities/broker_identification_types';

  constructor(
    private readonly wsp: WebServiceProvider,
    private readonly http: HttpClient
  ) {}

  public async getBrokers(): Promise<Broker[]> {
    const fields = [
      'id',
      'brokercode',
      'brokername',
      'nscccode',
      'sendallocations',
      'clearing_indicator',
      'clearingbrokerid',
      'environment',
      'showAlgo'
    ];

    const entities = await this.wsp.getHttp<BrokerFromApi[]>({
      endpoint: this._brokersEndpoint,
      params: {
        fields: fields
      }
    });

    return entities.map(this.formatBroker);
  }

  public getBrokersHTTP(): Promise<Broker[]> {
    const BROKERS_URL = 'broker';
    return this.http
      .get(BROKERS_URL)
      .pipe(
        map((brokersapidata: BrokerFromApi[]) =>
          brokersapidata.map(this.formatBroker)
        )
      )
      .toPromise();
  }

  public async postBrokerIdentifier(
    brokerIdentifier: BrokerIdentificationIds
  ): Promise<any> {
    const result = await this.wsp.postHttp<BrokerIdentificationIdsFromApi>({
      endpoint: this._brokerIdentificationIdEndpoint,
      body: {
        brokerId: brokerIdentifier.brokerId.toString(),
        brokerIdentificationId: brokerIdentifier.brokerIdentificationTypeId.toString(),
        brokerIdentifier: brokerIdentifier.brokerIdentifier
      }
    });

    return this.formatBrokerId(result);
  }

  public async putBrokerIdentifier(
    brokerIdentifier: BrokerIdentificationIds
  ): Promise<any> {
    const result = await this.wsp.putHttp<BrokerIdentificationIdsFromApi>({
      endpoint: this._brokerIdentificationIdEndpoint,
      body: {
        id: brokerIdentifier.id.toString(),
        brokerId: brokerIdentifier.brokerId.toString(),
        brokerIdentificationId: brokerIdentifier.brokerIdentificationTypeId.toString(),
        brokerIdentifier: brokerIdentifier.brokerIdentifier
      }
    });

    return this.formatBrokerId(result);
  }

  public async getBrokerIdentificationTypes(): Promise<
    BrokerIdentificationType[]
  > {
    const fields = ['id', 'type', 'description'];
    const brokerIdTypes = await this.wsp.getHttp<
      BrokerIdentificationTypeFromApi[]
    >({
      endpoint: this._brokerIdentificationTypesEndpoint,
      params: {
        fields: fields,
        orderBy: [
          {
            field: 'orderofimportance',
            direction: 'ASC'
          }
        ]
      }
    });

    return brokerIdTypes.map(this.formatBrokerIdType);
  }

  public async getBrokerIdentificationIds(
    brokerId: number
  ): Promise<BrokerIdentificationIds[]> {
    const fields = ['BrokerId', 'BrokerIdentificationId', 'BrokerIdentifier'];
    const brokerIdentificationIds = await this.wsp.getHttp<any[]>({
      endpoint: this._brokerIdentificationIdEndpoint,
      params: {
        fields: fields,
        filters: [
          {
            key: 'BrokerId',
            type: 'EQ',
            value: [brokerId.toString()]
          }
        ]
      }
    });

    return brokerIdentificationIds.map(this.formatBrokerId);
  }

  async getBrokerContacts(brokerId: number): Promise<BrokerContact[]> {
    const fields = ['id', 'brokerid', 'commtype', 'commaddress'];
    const brokerContacts = await this.wsp.getHttp<any[]>({
      endpoint: 'entities/broker_emails',
      params: {
        fields: fields,
        filters: [
          {
            key: 'brokerid',
            type: 'EQ',
            value: [brokerId.toString()]
          }
        ]
      }
    });

    return brokerContacts.map(this.formatBrokerContact);
  }

  public formatBroker(broker: BrokerFromApi): Broker {
    const id = parseInt(broker.id, 10);
    const clearingBrokerId = parseInt(broker.clearingbrokerid, 10);
    const newBroker = new Broker(
      !isNaN(id) ? id : null,
      broker.brokercode,
      broker.brokername,
      getBooleanFromString(broker.sendallocations),
      broker.clearing_indicator === 'True',
      !isNaN(clearingBrokerId) ? clearingBrokerId : null,
      broker.nscccode,
      broker.fixnetbrokercode,
      broker.environment as BrokerEnvironmentType
    );

    newBroker.showAlgo = getBooleanFromString(broker.showalgo);
    return newBroker;
  }

  private formatBrokerIdType(
    brokersIdType: BrokerIdentificationTypeFromApi
  ): BrokerIdentificationType {
    const id = parseInt(brokersIdType.id, 10);
    const orderOfImportance = parseInt(brokersIdType.orderofimportance, 10);
    return new BrokerIdentificationType(
      !isNaN(id) ? id : null,
      BrokerIdentificationTypes[brokersIdType.type],
      brokersIdType.description,
      !isNaN(orderOfImportance) ? id : null
    );
  }
  private formatBrokerId(
    brokerIdentifier: BrokerIdentificationIdsFromApi
  ): BrokerIdentificationIds {
    const id = parseInt(brokerIdentifier.id, 10);
    const brokerId = parseInt(brokerIdentifier.brokerid, 10);
    const brokerIdentificationId = parseInt(
      brokerIdentifier.brokeridentificationid,
      10
    );

    return new BrokerIdentificationIds(
      !isNaN(id) ? id : null,
      !isNaN(brokerId) ? brokerId : null,
      !isNaN(brokerIdentificationId) ? brokerIdentificationId : null,
      brokerIdentifier.brokeridentifier
    );
  }

  private formatBrokerContact(result: any): BrokerContact {
    if (result.commtype === '0') {
      result.commtype = 'PHONE';
    } else if (result.commtype === '1') {
      result.commtype = 'EMAIL';
    }
    return new BrokerContact(
      result.id ? parseInt(result.id, 10) : null,
      result.brokerid ? parseInt(result.brokerid, 10) : null,
      result.commtype, // BrokerCommunicationTypes[result.commtype],
      result.commaddress
    );
  }

  async postBrokerContact(
    brokerContact: BrokerContact
  ): Promise<BrokerContact> {
    const result = await this.wsp.postHttp({
      endpoint: this._brokerEmailsEndpoint,
      body: {
        commaddress: brokerContact.communicationAddress,
        commtype: brokerContact.communicationType.toString(),
        brokerid: brokerContact.brokerId.toString()
      }
    });

    return this.formatBrokerContact(result);
  }

  async putBrokerContact(brokerContact: BrokerContact): Promise<BrokerContact> {
    const result = await this.wsp.putHttp<any>({
      endpoint: this._brokerEmailsEndpoint,
      body: {
        id: brokerContact.id.toString(),
        commaddress: brokerContact.communicationAddress,
        commtype: brokerContact.communicationType.toString(),
        brokerid: brokerContact.brokerId.toString()
      }
    });

    return this.formatBrokerContact(result);
  }

  async getBroker(id: number): Promise<any> {
    const fields = [
      'id',
      'brokercode',
      'brokername',
      'nscccode',
      'sendallocations',
      'clearing_indicator',
      'clearingbrokerid',
      'environment'
    ];

    const result = await this.wsp.getHttp<BrokerFromApi[]>({
      endpoint: this._brokersEndpoint,
      params: {
        filters: [
          {
            key: 'id',
            type: 'EQ',
            value: [id.toString()]
          }
        ],
        fields
      }
    });

    return this.formatBroker(result[0]);
  }

  async postBroker(broker: Broker): Promise<Broker> {
    const clearingbrokerid =
      broker.clearingIndicator.toString() !== 'false'
        ? 'null'
        : broker.clearingBrokerId
        ? broker.clearingBrokerId.toString()
        : 'null';

    const result = await this.wsp.postHttp<BrokerFromApi>({
      endpoint: this._brokersEndpoint,
      body: {
        clearingbrokerid: clearingbrokerid.toString(),
        brokercode: broker.brokerCode,
        brokername: broker.brokerName,
        sendallocations: broker.sendAllocations.toString(),
        clearing_indicator: broker.clearingIndicator.toString(),
        nscccode: broker.nsccCode ? broker.nsccCode : 'null'
      }
    });

    return this.formatBroker(result);
  }

  async putBroker(payload: Broker): Promise<Broker> {
    const payloadNew: any = payload;
    Object.keys(payload).forEach(key => {
      if (key === 'clearingIndicator') {
        payloadNew['clearing_indicator'] = payload.clearingIndicator.toString();
        delete payloadNew['clearingIndicator'];
      } else if (key == 'sendAllocations') {
        payloadNew[key] = payload[key].toString();
        delete payloadNew[key];
      } else if (
        typeof payload[key] === 'number' &&
        payload[key] === Number(payload[key]) &&
        payload[key] !== Infinity &&
        payload[key] !== !Infinity
      ) {
        payloadNew[key] = payload[key].toString();
      }
    });
    if (
      payloadNew.hasOwnProperty('clearingBrokerId') &&
      payloadNew.clearingBrokerId == null
    ) {
      payloadNew.clearingBrokerId = 'null';
    }

    if (
      payloadNew.hasOwnProperty('clearing_indicator') &&
      payloadNew.clearing_indicator !== 'false'
    ) {
      payloadNew.clearingBrokerId = 'null';
    }
    const result = await this.wsp.putHttp<BrokerFromApi>({
      endpoint: this._brokersEndpoint,
      body: payloadNew
    });

    return this.formatBroker(result);
  }

  async deleteBrokerIdentificationId(id: number): Promise<string> {
    return this.wsp.deleteHttp({
      endpoint: `${this._brokerIdentificationIdEndpoint}/${id}`
    });
  }

  async deleteBrokerContact(id: number): Promise<string> {
    return this.wsp.deleteHttp({
      endpoint: `${this._brokerEmailsEndpoint}/${id}`
    });
  }

  async deleteBroker(id: number): Promise<string> {
    return this.wsp.deleteHttp({
      endpoint: `${this._brokersEndpoint}/${id}`
    });
  }
}
