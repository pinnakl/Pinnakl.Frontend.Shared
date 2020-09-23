// Angular
import { Injectable } from '@angular/core';

// Models
import {
  DeleteWebRequest,
  GetWebRequest,
  PostWebRequest,
  PutWebRequest,
  WebServiceProvider
} from '@pnkl-frontend/core';
import { BrokerIdentificationIds } from '../models/oms/broker/broker-identification-ids.model';
import { BrokerIdentificationIdsFromApi } from '../models/oms/broker/broker-identification-ids.model';
import { BrokerIdentificationType } from '../models/oms/broker/broker-identification-type.model';
import { BrokerIdentificationTypeFromApi } from '../models/oms/broker/broker-identification-type.model';
import { BrokerIdentificationTypes } from '../models/oms/broker/broker-identification-types.model';
import { Broker } from '../models/oms/broker/broker.model';
import { BrokerFromApi } from '../models/oms/broker/broker.model';
import { BrokerContact } from './../models/oms/broker/broker-contact.model';

// Services
import { Utility } from '../services/utility.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BrokerService {
  private readonly BROKER_API_URL = '/brokers';
  private readonly BROKER_IDENTIFICATION_TYPE_API_URL =
    '/broker_identification_types';
  private readonly BROKER_IDENTIFICATION_ID_API_URL =
    '/broker_identification_Id';

  constructor(
    private wsp: WebServiceProvider,
    private utility: Utility,
    private http: HttpClient
  ) {}

  public getBrokers(): Promise<Broker[]> {
    // tslint:disable-next-line:max-line-length

    let fields = [
      'id',
      'brokercode',
      'brokername',
      'nscccode',
      'sendallocations',
      'clearing_indicator',
      'clearingbrokerid',
      'commissionPerShare'
    ];

    const getWebRequest: GetWebRequest = {
      endPoint: this.BROKER_API_URL,
      options: {
        fields: fields
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((entities: BrokerFromApi[]) => {
        return entities.map(entity => this.formatBroker(entity));
      })
      .then(check => {
        return check;
      });
  }

  public getBrokersHTTP(): Promise<Broker[]> {
    const BROKERS_URL = 'broker';
    return this.http
      .get(BROKERS_URL)
      .toPromise()
      .then((brokersapidata: BrokerFromApi[]) => {
        const brokers = brokersapidata.map(p => this.formatBroker(p));
        return brokers;
      });
  }

  public postBrokerIdentifier(
    brokerIdentifier: BrokerIdentificationIds
  ): Promise<any> {
    let payload = {
      brokerId: brokerIdentifier.brokerId,
      brokerIdentificationId: brokerIdentifier.brokerIdentificationTypeId,
      brokerIdentifier: brokerIdentifier.brokerIdentifier
    };

    const postWebRequest: PostWebRequest = {
      endPoint: this.BROKER_IDENTIFICATION_ID_API_URL,
      payload: payload
    };

    return this.wsp
      .post(postWebRequest)
      .then(result => this.formatBrokerId(result));
  }

  public putBrokerIdentifier(
    brokerIdentifier: BrokerIdentificationIds
  ): Promise<any> {
    let payload = {
      id: brokerIdentifier.id,
      brokerId: brokerIdentifier.brokerId,
      brokerIdentificationId: brokerIdentifier.brokerIdentificationTypeId,
      brokerIdentifier: brokerIdentifier.brokerIdentifier
    };

    const putWebRequest: PutWebRequest = {
      endPoint: this.BROKER_IDENTIFICATION_ID_API_URL,
      payload: payload
    };

    return this.wsp
      .put(putWebRequest)
      .then(result => this.formatBrokerId(result));
  }

  public getBrokerIdentificationTypes(): Promise<BrokerIdentificationType[]> {
    let fields = ['id', 'type', 'description'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.BROKER_IDENTIFICATION_TYPE_API_URL,
      options: {
        fields: fields,
        orderBy: [
          {
            field: 'orderofimportance',
            direction: 'ASC'
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((brokersIdTypes: BrokerIdentificationTypeFromApi[]) =>
        brokersIdTypes.map(brokersIdType =>
          this.formatBrokerIdType(brokersIdType)
        )
      );
  }
  public getBrokerIdentificationIds(
    brokerId: number
  ): Promise<BrokerIdentificationIds[]> {
    let fields = ['BrokerId', 'BrokerIdentificationId', 'BrokerIdentifier'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.BROKER_IDENTIFICATION_ID_API_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'BrokerId',
            type: 'EQ',
            value: [brokerId.toString()]
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((brokerIds: BrokerIdentificationIdsFromApi[]) =>
        brokerIds.map(brokerIdentifier => this.formatBrokerId(brokerIdentifier))
      );
  }

  getBrokerContacts(brokerId: number): Promise<BrokerContact[]> {
    let fields = ['id', 'brokerid', 'commtype', 'commaddress'];
    const getWebRequest: GetWebRequest = {
      endPoint: 'broker_emails',
      options: {
        fields: fields,
        filters: [
          {
            key: 'brokerid',
            type: 'EQ',
            value: [brokerId.toString()]
          }
        ]
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then(result => result.map(x => this.formatBrokerContact(x)));
  }

  private formatBroker(broker: BrokerFromApi): Broker {
    let id = parseInt(broker.id);
    let clearingBrokerId = parseInt(broker.clearingbrokerid);
    return new Broker(
      !isNaN(id) ? id : null,
      broker.brokercode,
      broker.brokername,
      broker.sendallocations === 'True' ? true : false,
      broker.clearing_indicator === 'True' ? true : false,
      !isNaN(clearingBrokerId) ? clearingBrokerId : null,
      broker.nscccode,
      +broker.commissionpershare
    );
  }
  private formatBrokerIdType(
    brokersIdType: BrokerIdentificationTypeFromApi
  ): BrokerIdentificationType {
    let id = parseInt(brokersIdType.id);
    let orderOfImportance = parseInt(brokersIdType.orderofimportance);
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
    let id = parseInt(brokerIdentifier.id);
    let brokerId = parseInt(brokerIdentifier.brokerid);
    let brokerIdentificationId = parseInt(
      brokerIdentifier.brokeridentificationid
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
      result.id ? parseInt(result.id) : null,
      result.brokerid ? parseInt(result.brokerid) : null,
      result.commtype, // BrokerCommunicationTypes[result.commtype],
      result.commaddress
    );
  }

  postBrokerContact(brokerContact: BrokerContact): Promise<BrokerContact> {
    const postWebRequest: PostWebRequest = {
      endPoint: 'broker_emails',
      payload: {
        commaddress: brokerContact.communicationAddress,
        commtype: brokerContact.communicationType,
        brokerid: brokerContact.brokerId
      }
    };

    return this.wsp
      .post(postWebRequest)
      .then(result => this.formatBrokerContact(result));
  }

  putBrokerContact(brokerContact: BrokerContact): Promise<BrokerContact> {
    const putWebRequest: PutWebRequest = {
      endPoint: 'broker_emails',
      payload: {
        id: brokerContact.id,
        commaddress: brokerContact.communicationAddress,
        commtype: brokerContact.communicationType,
        brokerid: brokerContact.brokerId
      }
    };

    return this.wsp
      .put(putWebRequest)
      .then(result => this.formatBrokerContact(result));
  }

  getBroker(id: number): Promise<any> {
    let getWebRequest: GetWebRequest = {
      endPoint: this.BROKER_API_URL,
      options: {
        id: id.toString()
      }
    };

    return this.wsp.get(getWebRequest).then(result => {
      return this.formatBroker(result[0]);
    });
  }

  postBroker(broker: Broker): Promise<Broker> {
    let payload = {
      brokercode: broker.brokerCode,
      brokername: broker.brokerName,
      sendallocations: broker.sendAllocations.toString(),
      clearing_indicator: broker.clearingIndicator.toString(),
      clearingbrokerid: broker.clearingBrokerId
        ? broker.clearingBrokerId.toString()
        : 'null',
      nscccode: broker.nsccCode ? broker.nsccCode : 'null'
    };

    if (payload.clearing_indicator !== 'false') {
      payload.clearingbrokerid = 'null';
    }

    let postWebRequest: PostWebRequest = {
      endPoint: this.BROKER_API_URL,
      payload: payload
    };

    return this.wsp
      .post(postWebRequest)
      .then(result => this.formatBroker(result));
  }

  putBroker(payload: Broker): Promise<Broker> {
    let payloadNew: any = payload;
    Object.keys(payload).forEach(key => {
      if (key === 'clearingIndicator') {
        payloadNew['clearing_indicator'] = payload.clearingIndicator.toString();
        delete payloadNew['clearingIndicator'];
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
    const putWebRequest: PutWebRequest = {
      endPoint: this.BROKER_API_URL,
      payload: payloadNew
    };
    return this.wsp
      .put(putWebRequest)
      .then(result => this.formatBroker(result));
  }

  deleteBrokerIdentificationId(id: number): Promise<string> {
    const deleteWebRequest: DeleteWebRequest = {
      endPoint: this.BROKER_IDENTIFICATION_ID_API_URL,
      payload: {
        id: id
      }
    };
    return this.wsp.delete(deleteWebRequest);
  }

  deleteBrokerContact(id: number): Promise<string> {
    const deleteWebRequest: DeleteWebRequest = {
      endPoint: 'broker_emails',
      payload: {
        id: id
      }
    };
    return this.wsp.delete(deleteWebRequest);
  }

  deleteBroker(id: number): Promise<string> {
    const deleteWebRequest: DeleteWebRequest = {
      endPoint: 'brokers',
      payload: {
        id: id
      }
    };
    return this.wsp.delete(deleteWebRequest);
  }
}
