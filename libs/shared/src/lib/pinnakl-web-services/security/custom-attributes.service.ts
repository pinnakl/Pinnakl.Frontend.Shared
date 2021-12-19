import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import * as moment from 'moment';

import {
  WebServiceProvider
} from '@pnkl-frontend/core';
import { CustomAttributeFeature, CustomAttributeMappingTable } from '../../models';
import { CustomAttributeFromApi } from '../../models/custom-attributes/custom-attribute-from-api.model';
import { CustomAttributeListOptionFromApi } from '../../models/custom-attributes/custom-attribute-list-option-from-api.model';
import { CustomAttributeListOption } from '../../models/custom-attributes/custom-attribute-list-option.model';
import { CustomAttributeValueFromApi } from '../../models/custom-attributes/custom-attribute-value-from-api.model';
import { CustomAttributeValue } from '../../models/custom-attributes/custom-attribute-value.model';
import { CustomAttribute } from '../../models/custom-attributes/custom-attribute.model';

@Injectable()
export class CustomAttributesService {
  private readonly _securityCustomAttributesEndpoint = 'entities/security_custom_attributes';
  private readonly _securityCustomAttributeListOptionsEndpoint =
    'entities/security_custom_attribute_list_options';
  private readonly _securityCustomAttributeValuesEndpoint =
    'entities/security_custom_attribute_values';

  constructor(private readonly wsp: WebServiceProvider) { }

  deleteCustomAttribute(id: number): Promise<void> {
    return this.wsp.deleteHttp({
      endpoint: `${this._securityCustomAttributesEndpoint}/${id}`
    });
  }

  deleteCustomAttributeListOption(id: number): Promise<void> {
    return this.wsp.deleteHttp({
      endpoint: `${this._securityCustomAttributeListOptionsEndpoint}/${id}`
    });
  }

  deleteCustomAttributeValue(id: number): Promise<void> {
    return this.wsp.deleteHttp({
      endpoint: `${this._securityCustomAttributeValuesEndpoint}/${id}`
    });
  }

  async getCustomAttributes(feature?: string): Promise<CustomAttribute[]> {
    const customAttributes = await this.getCustomAttributesWithoutListOptions(feature);

    const promises = _(customAttributes)
      .filter({ type: 'List' })
      .map(attribute =>
        this.getCustomAttributeListOptions(attribute.id).then(
          listOptions =>
            (attribute.listOptions = _.sortBy(listOptions, ['viewOrder']))
        )
      )
      .value();

    const result = await Promise.all([customAttributes, Promise.all(promises)]);

    const [customAttrs] = result;
    return customAttrs;
  }

  async getCustomAttributesWithoutListOptions(feature: string): Promise<CustomAttribute[]> {
    const entities = await this.wsp.getHttp<CustomAttributeFromApi[]>({
      endpoint: this._securityCustomAttributesEndpoint,
      params: feature ? {
        filters: [
          {
            key: 'Feature',
            type: 'EQ',
            value: [feature]
          },
        ]
      } : {}
    });

    return entities.map(this.formatCustomAttribute);
  }

  async getCustomAttributeValuesForAttribute(
    attributeId: number
  ): Promise<CustomAttributeValue[]> {
    const entities = await this.wsp.getHttp<CustomAttributeValueFromApi[]>({
      endpoint: this._securityCustomAttributeValuesEndpoint,
      params: {
        fields: ['CustomAttributeId', 'Id', 'SecurityId', 'Type', 'Value'],
        filters: [
          {
            key: 'CustomAttributeId',
            type: 'EQ',
            value: [attributeId.toString()]
          }
        ]
      }
    });

    return entities.map(this.formatCustomAttributeValue);
  }

  async getCustomAttributeValuesForFeature(
    id: number,
    feature: 'Investor' | 'Security' | 'Contact'
  ): Promise<CustomAttributeValue[]> {
    const entities = await this.wsp.getHttp<CustomAttributeValueFromApi[]>({
      endpoint: this._securityCustomAttributeValuesEndpoint,
      params: {
        fields: ['CustomAttributeId', 'Id', `${feature}Id`, 'Type', 'Value'],
        filters: [
          {
            key: `${feature}Id`,
            type: 'EQ',
            value: [id.toString()]
          }
        ]
      }
    });

    return entities.map(this.formatCustomAttributeValue);
  }

  async postCustomAttribute(
    entityToSave: CustomAttribute,
    feature: CustomAttributeFeature,
    mappingTable: CustomAttributeMappingTable
  ): Promise<CustomAttribute> {
    const entity = await this.wsp.postHttp<CustomAttributeFromApi>({
      endpoint: this._securityCustomAttributesEndpoint,
      body: this.getCustomAttributeForServiceRequest(entityToSave, feature, mappingTable)
    });

    return this.formatCustomAttribute(entity);
  }

  async postCustomAttributeListOption(
    entityToSave: CustomAttributeListOption
  ): Promise<CustomAttributeListOption> {
    const entity = await this.wsp.postHttp<CustomAttributeListOptionFromApi>({
      endpoint: this._securityCustomAttributeListOptionsEndpoint,
      body: this.getCustomAttributeListOptionForServiceRequest(entityToSave)
    });

    return this.formatCustomAttributeListOption(entity);
  }

  async postCustomAttributeValue(
    entityToSave: CustomAttributeValue,
    feature?: CustomAttributeFeature,
    mappingTable?: CustomAttributeMappingTable
  ): Promise<CustomAttributeValue> {
    const entity = await this.wsp.postHttp<CustomAttributeValueFromApi>({
      endpoint: this._securityCustomAttributeValuesEndpoint,
      body: this.getCustomAttributeValueForServiceRequest(
        entityToSave,
        feature === CustomAttributeFeature.ORGANIZATION ? 'Investor' : feature
      )
    });

    return this.formatCustomAttributeValue(entity);
  }

  async putCustomAttribute(
    entityToSave: CustomAttribute,
    feature: CustomAttributeFeature,
    mappingTable: CustomAttributeMappingTable
  ): Promise<CustomAttribute> {
    const entity = await this.wsp.putHttp<CustomAttributeFromApi>({
      endpoint: this._securityCustomAttributesEndpoint,
      body: this.getCustomAttributeForServiceRequest(entityToSave, feature, mappingTable),
    });

    return this.formatCustomAttribute(entity);
  }

  async putCustomAttributeListOption(
    entityToSave: CustomAttributeListOption
  ): Promise<CustomAttributeListOption> {
    const entity = await this.wsp.putHttp<CustomAttributeListOptionFromApi>({
      endpoint: this._securityCustomAttributeListOptionsEndpoint,
      body: this.getCustomAttributeListOptionForServiceRequest(entityToSave)
    });

    return this.formatCustomAttributeListOption(entity);
  }

  async putCustomAttributeValue(
    entityToSave: CustomAttributeValue,
    feature?: CustomAttributeFeature,
    mappingTable?: CustomAttributeMappingTable
  ): Promise<CustomAttributeValue> {
    const entity = await this.wsp.putHttp<CustomAttributeValueFromApi>({
      endpoint: this._securityCustomAttributeValuesEndpoint,
      body: this.getCustomAttributeValueForServiceRequest(
        entityToSave,
        feature === CustomAttributeFeature.ORGANIZATION ? 'Investor' : feature
      )
    });

    return this.formatCustomAttributeValue(entity);
  }

  public formatCustomAttribute(
    entity: CustomAttributeFromApi
  ): CustomAttribute {
    const id = parseInt(entity.id, 10);
    return new CustomAttribute(
      !isNaN(id) ? id : null,
      entity.name,
      entity.type
    );
  }

  public formatCustomAttributeListOption(
    entity: CustomAttributeListOptionFromApi
  ): CustomAttributeListOption {
    const id = parseInt(entity.id, 10);
    const viewOrder = parseInt(entity.vieworder, 10);
    const customAttributeId = parseInt(entity.customattributeid, 10);

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
    const customAttributeId = parseInt(entity.customattributeid, 10),
      id = parseInt(entity.id, 10),
      securityId = parseInt(entity.securityid, 10),
      type = entity.type,
      value = entity.value;
    let parsedValue;
    switch (type) {
      case 'Number':
        const floatValue = parseFloat(value);
        parsedValue = !isNaN(floatValue) ? floatValue : null;
        break;
      case 'Date':
        const valueMoment = moment(value, 'MM/DD/YYYY');
        parsedValue = valueMoment.isValid() ? valueMoment.toDate() : null;
        break;
      case 'Checkbox':
        parsedValue = value === '1';
        break;
      default:
        parsedValue = value;
    }
    return new CustomAttributeValue({
      customAttributeId: !isNaN(customAttributeId) ? customAttributeId : null,
      id: !isNaN(id) ? entity.id : null,
      securityId: !isNaN(securityId) ? securityId : null,
      type: type,
      value: parsedValue
    });
  }

  private async getCustomAttributeListOptions(
    customAttributeId: number
  ): Promise<CustomAttributeListOption[]> {
    const entities = await this.wsp
      .getHttp<CustomAttributeListOptionFromApi[]>({
        endpoint: this._securityCustomAttributeListOptionsEndpoint,
        params: {
          fields: ['CustomAttributeId', 'Id', 'ListOption', 'ViewOrder'],
          filters: [
            {
              key: 'CustomAttributeId',
              type: 'EQ',
              value: [customAttributeId.toString()]
            }
          ]
        }
      });

    return entities.map(this.formatCustomAttributeListOption);
  }

  private getCustomAttributeForServiceRequest(
    entity: CustomAttribute,
    feature: CustomAttributeFeature,
    mappingTable: CustomAttributeMappingTable
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
    entityForApi.feature = feature;
    entityForApi.mappingTable = mappingTable;

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
    entity: CustomAttributeValue,
    feature: 'Investor' | 'Security' | 'Contact'
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
        case 'Checkbox':
          entityForApi.value = value ? '1' : '0';
          break;
        default:
          entityForApi.value = typeof value === 'boolean' ? (+value).toString() : <string>value;
      }
    }
    entityForApi[`${feature?.toLowerCase()}id`] = entity[`${feature?.toLowerCase()}Id`]?.toString();
    return entityForApi;
  }
}
