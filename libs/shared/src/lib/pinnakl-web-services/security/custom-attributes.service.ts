import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import * as moment from 'moment';

import {
  GetWebRequest,
  PostWebRequest,
  PutWebRequest,
  WebServiceProvider
} from '@pnkl-frontend/core';
import { CustomAttributeFromApi } from '../../models/security/custom-attribute-from-api.model';
import { CustomAttributeListOptionFromApi } from '../../models/security/custom-attribute-list-option-from-api.model';
import { CustomAttributeListOption } from '../../models/security/custom-attribute-list-option.model';
import { CustomAttributeValueFromApi } from '../../models/security/custom-attribute-value-from-api.model';
import { CustomAttributeValue } from '../../models/security/custom-attribute-value.model';
import { CustomAttribute } from '../../models/security/custom-attribute.model';

@Injectable()
export class CustomAttributesService {
  private readonly CUSTOM_ATTRIBUTES_URL = 'security_custom_attributes';
  private readonly CUSTOM_ATTRIBUTE_LIST_OPTIONS_URL =
    'security_custom_attribute_list_options';
  private readonly CUSTOM_ATTRIBUTE_VALUES_URL =
    'security_custom_attribute_values';
  constructor(private wsp: WebServiceProvider) {}

  deleteCustomAttribute(id: number): Promise<void> {
    return this.wsp.delete({
      endPoint: this.CUSTOM_ATTRIBUTES_URL,
      payload: {
        id: id.toString()
      }
    });
  }

  deleteCustomAttributeListOption(id: number): Promise<void> {
    return this.wsp.delete({
      endPoint: this.CUSTOM_ATTRIBUTE_LIST_OPTIONS_URL,
      payload: {
        id: id.toString()
      }
    });
  }

  deleteCustomAttributeValue(id: number): Promise<void> {
    return this.wsp.delete({
      endPoint: this.CUSTOM_ATTRIBUTE_VALUES_URL,
      payload: {
        id: id.toString()
      }
    });
  }

  getCustomAttributes(): Promise<CustomAttribute[]> {
    return this.getCustomAttributesWithoutListOptions()
      .then(customAttributes => {
        const promises = _(customAttributes)
          .filter({ type: 'List' })
          .map(attribute =>
            this.getCustomAtttributeListOptions(attribute.id).then(
              listOptions =>
                (attribute.listOptions = _.sortBy(listOptions, ['viewOrder']))
            )
          )
          .value();
        return Promise.all([customAttributes, Promise.all(promises)]);
      })
      .then(result => {
        const [customAttributes] = result;
        return customAttributes;
      });
  }

  getCustomAttributesWithoutListOptions(): Promise<CustomAttribute[]> {
    const getWebRequest: GetWebRequest = {
      endPoint: this.CUSTOM_ATTRIBUTES_URL
    };
    return this.wsp
      .get(getWebRequest)
      .then((entities: CustomAttributeFromApi[]) => {
        return entities.map(entity => this.formatCustomAttribute(entity));
      });
  }

  getCustomAttributeValuesForAttribute(
    attributeId: number
  ): Promise<CustomAttributeValue[]> {
    const fields = ['CustomAttributeId', 'Id', 'SecurityId', 'Type', 'Value'],
      getWebRequest: GetWebRequest = {
        endPoint: this.CUSTOM_ATTRIBUTE_VALUES_URL,
        options: {
          fields,
          filters: [
            {
              key: 'CustomAttributeId',
              type: 'EQ',
              value: [attributeId.toString()]
            }
          ]
        }
      };
    return this.wsp
      .get(getWebRequest)
      .then((entities: CustomAttributeValueFromApi[]) =>
        entities.map(entity => this.formatCustomAttributeValue(entity))
      );
  }

  getCustomAttributeValuesForSecurity(
    securityId: number
  ): Promise<CustomAttributeValue[]> {
    const fields = ['CustomAttributeId', 'Id', 'SecurityId', 'Type', 'Value'],
      getWebRequest: GetWebRequest = {
        endPoint: this.CUSTOM_ATTRIBUTE_VALUES_URL,
        options: {
          fields,
          filters: [
            {
              key: 'SecurityId',
              type: 'EQ',
              value: [securityId.toString()]
            }
          ]
        }
      };
    return this.wsp
      .get(getWebRequest)
      .then((entities: CustomAttributeValueFromApi[]) =>
        entities.map(entity => this.formatCustomAttributeValue(entity))
      );
  }

  postCustomAttribute(entityToSave: CustomAttribute): Promise<CustomAttribute> {
    const requestBody = this.getCustomAttributeForServiceRequest(entityToSave);
    const postWebRequest: PostWebRequest = {
      endPoint: this.CUSTOM_ATTRIBUTES_URL,
      payload: requestBody
    };
    return this.wsp
      .post(postWebRequest)
      .then(entity => this.formatCustomAttribute(entity));
  }

  postCustomAttributeListOption(
    entityToSave: CustomAttributeListOption
  ): Promise<CustomAttributeListOption> {
    const requestBody = this.getCustomAttributeListOptionForServiceRequest(
      entityToSave
    );
    const postWebRequest: PostWebRequest = {
      endPoint: this.CUSTOM_ATTRIBUTE_LIST_OPTIONS_URL,
      payload: requestBody
    };
    return this.wsp
      .post(postWebRequest)
      .then(entity => this.formatCustomAttributeListOption(entity));
  }

  postCustomAttributeValue(
    entityToSave: CustomAttributeValue
  ): Promise<CustomAttributeValue> {
    const requestBody = this.getCustomAttributeValueForServiceRequest(
      entityToSave
    );
    const postWebRequest: PostWebRequest = {
      endPoint: this.CUSTOM_ATTRIBUTE_VALUES_URL,
      payload: requestBody
    };
    return this.wsp
      .post(postWebRequest)
      .then(entity => this.formatCustomAttributeValue(entity));
  }

  putCustomAttribute(entityToSave: CustomAttribute): Promise<CustomAttribute> {
    const requestBody = this.getCustomAttributeForServiceRequest(entityToSave);
    const putWebRequest: PutWebRequest = {
      endPoint: this.CUSTOM_ATTRIBUTES_URL,
      payload: requestBody
    };
    return this.wsp
      .put(putWebRequest)
      .then(entity => this.formatCustomAttribute(entity));
  }

  putCustomAttributeListOption(
    entityToSave: CustomAttributeListOption
  ): Promise<CustomAttributeListOption> {
    const requestBody = this.getCustomAttributeListOptionForServiceRequest(
      entityToSave
    );
    const putWebRequest: PutWebRequest = {
      endPoint: this.CUSTOM_ATTRIBUTE_LIST_OPTIONS_URL,
      payload: requestBody
    };
    return this.wsp
      .put(putWebRequest)
      .then(entity => this.formatCustomAttributeListOption(entity));
  }

  putCustomAttributeValue(
    entityToSave: CustomAttributeValue
  ): Promise<CustomAttributeValue> {
    const requestBody = this.getCustomAttributeValueForServiceRequest(
      entityToSave
    );
    const putWebRequest: PutWebRequest = {
      endPoint: this.CUSTOM_ATTRIBUTE_VALUES_URL,
      payload: requestBody
    };
    return this.wsp
      .put(putWebRequest)
      .then(entity => this.formatCustomAttributeValue(entity));
  }

  private formatCustomAttribute(
    entity: CustomAttributeFromApi
  ): CustomAttribute {
    const id = parseInt(entity.id);
    return new CustomAttribute(
      !isNaN(id) ? id : null,
      entity.name,
      entity.type
    );
  }

  private formatCustomAttributeListOption(
    entity: CustomAttributeListOptionFromApi
  ): CustomAttributeListOption {
    const customAttributeId = parseInt(entity.customattributeid),
      id = parseInt(entity.id),
      viewOrder = parseInt(entity.vieworder);
    return new CustomAttributeListOption(
      !isNaN(customAttributeId) ? customAttributeId : null,
      !isNaN(id) ? id : null,
      entity.listoption,
      !isNaN(viewOrder) ? viewOrder : null
    );
  }

  private formatCustomAttributeValue(
    entity: CustomAttributeValueFromApi
  ): CustomAttributeValue {
    let customAttributeId = parseInt(entity.customattributeid),
      id = parseInt(entity.id),
      securityId = parseInt(entity.securityid),
      type = entity.type,
      value = entity.value,
      parsedValue;
    switch (type) {
      case 'Number':
        const floatValue = parseFloat(value);
        parsedValue = !isNaN(floatValue) ? floatValue : null;
        break;
      case 'Date':
        const valueMoment = moment(value, 'MM/DD/YYYY');
        parsedValue = valueMoment.isValid() ? valueMoment.toDate() : null;
        break;
      default:
        parsedValue = value;
    }
    return new CustomAttributeValue(
      !isNaN(customAttributeId) ? customAttributeId : null,
      !isNaN(id) ? id : null,
      !isNaN(securityId) ? securityId : null,
      type,
      parsedValue
    );
  }

  private getCustomAtttributeListOptions(
    customAttributeId: number
  ): Promise<CustomAttributeListOption[]> {
    const fields = ['CustomAttributeId', 'Id', 'ListOption', 'ViewOrder'],
      getWebRequest: GetWebRequest = {
        endPoint: this.CUSTOM_ATTRIBUTE_LIST_OPTIONS_URL,
        options: {
          fields,
          filters: [
            {
              key: 'CustomAttributeId',
              type: 'EQ',
              value: [customAttributeId.toString()]
            }
          ]
        }
      };
    return this.wsp
      .get(getWebRequest)
      .then((entities: CustomAttributeListOptionFromApi[]) =>
        entities.map(entity => this.formatCustomAttributeListOption(entity))
      );
  }

  private getCustomAttributeForServiceRequest(
    entity: CustomAttribute
  ): CustomAttributeFromApi {
    const entityForApi = {} as CustomAttributeFromApi,
      { id, name, type } = entity;
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (name !== undefined) {
      entityForApi.name = name;
    }
    if (type !== undefined) {
      entityForApi.type = type;
    }
    return entityForApi;
  }

  private getCustomAttributeListOptionForServiceRequest(
    entity: CustomAttributeListOption
  ): CustomAttributeListOptionFromApi {
    const entityForApi = {} as CustomAttributeListOptionFromApi,
      { customAttributeId, id, listOption, viewOrder } = entity;
    if (customAttributeId !== undefined) {
      entityForApi.customattributeid = customAttributeId.toString();
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (listOption !== undefined) {
      entityForApi.listoption = listOption;
    }
    if (viewOrder !== undefined) {
      entityForApi.vieworder = viewOrder.toString();
    }
    return entityForApi;
  }

  private getCustomAttributeValueForServiceRequest(
    entity: CustomAttributeValue
  ): CustomAttributeValueFromApi {
    const entityForApi = {} as CustomAttributeValueFromApi,
      { customAttributeId, id, securityId, type, value } = entity;
    if (customAttributeId !== undefined) {
      entityForApi.customattributeid = customAttributeId.toString();
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (securityId !== undefined) {
      entityForApi.securityid = securityId.toString();
    }
    if (value !== undefined) {
      switch (type) {
        case 'Date':
          entityForApi.value = moment(value).format('MM/DD/YYYY');
          break;
        case 'Number':
          entityForApi.value = value.toString();
          break;
        default:
          entityForApi.value = <string>value;
      }
    }
    return entityForApi;
  }
}
