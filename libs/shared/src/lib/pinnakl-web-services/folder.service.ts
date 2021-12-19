import { Injectable } from '@angular/core';

import {
  WebServiceProvider
} from '@pnkl-frontend/core';
import { Folder } from '../models/oms';
import { CustomAttributeOMS } from '../models/oms';

@Injectable()
export class FolderService {
  private readonly _tradeFolderEndpoint = 'entities/trade_folder';
  private readonly _tradeRequestsEndpoint = 'entities/trade_requests';
  private readonly _tradeRequestCustomEndpoint = 'entities/trade_request_custom';
  private readonly _tradeReqCustomColClientMapEndpoint = 'entities/trade_req_custom_col_client_map';

  constructor(private readonly wsp: WebServiceProvider) {}

  async getFolders(): Promise<Folder[]> {
    const folders = await this.wsp.getHttp<any[]>({
      endpoint: this._tradeFolderEndpoint,
      params: {
        fields: ['id', 'col1']
      }
    });

    return folders.map(this.formatFolder);
  }

  private formatFolder(result: any): Folder {
    const id = parseInt(result.id, 10);
    return new Folder(!isNaN(id) ? id : null, result.col1);
  }

  async saveFolder(
    col1: string,
    col2: string,
    col3: string,
    col4: string,
    col5: string
  ): Promise<any> {
    return this.wsp.postHttp({
      endpoint: this._tradeRequestCustomEndpoint,
      body: {
        Col1: col1,
        Col2: col2,
        Col3: col3,
        Col4: col4,
        Col5: col5
      }
    });
  }

  async updateFolder(
    id: number,
    col1: string,
    col2: string,
    col3: string,
    col4: string,
    col5: string
  ): Promise<any> {
    return this.wsp.putHttp({
      endpoint: this._tradeRequestCustomEndpoint,
      body: {
        id: id.toString(),
        Col1: col1,
        Col2: col2,
        Col3: col3,
        Col4: col4,
        Col5: col5
      }
    });
  }

  async confirmDeleteForFolder(id: number): Promise<any> {
    return this.wsp.getHttp<any[]>({
      endpoint: this._tradeRequestsEndpoint,
      params: {
        fields: ['id'],
        filters: [
          {
            key: 'customattribid',
            type: 'EQ',
            value: [id.toString()]
          }
        ]
      }
    });
  }

  async deleteFolder(id: number): Promise<any> {
    return this.wsp.deleteHttp({
      endpoint: `${this._tradeRequestCustomEndpoint}/${id}`
    });
  }

  async getCustomAttribList(): Promise<CustomAttributeOMS[]> {
    const tradeReqTags = await this.wsp.getHttp<any[]>({
      endpoint: this._tradeReqCustomColClientMapEndpoint,
      params: {
        fields: ['ColName', 'ColMappedTo']
      }
    });

    return tradeReqTags.map(this.formatCustomAttribute);
  }

  private formatCustomAttribute(result: any): CustomAttributeOMS {
    const id = parseInt(result.id, 10);
    return new CustomAttributeOMS(
      !isNaN(id) ? id : null,
      result.colname,
      result.colmappedto
    );
  }

  async getAllCustomValues(): Promise<any[]> {
    return this.wsp.getHttp<any[]>({
      endpoint: 'entities/trade_request_custom',
      params: {
        fields: ['Col1', 'Col2', 'Col3', 'Col4', 'Col5']
      }
    });
  }
}
