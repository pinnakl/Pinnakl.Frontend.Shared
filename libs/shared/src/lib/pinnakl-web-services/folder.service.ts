import { Injectable } from '@angular/core';

import {
  DeleteWebRequest,
  GetWebRequest,
  PostWebRequest,
  PutWebRequest,
  WebServiceProvider
} from '@pnkl-frontend/core';
import { Folder } from '../models/oms/folder.model';
import { CustomAttributeOMS} from '../models/oms/custom-attribute-oms.model';

@Injectable()
export class FolderService {
  constructor(private wsp: WebServiceProvider) {}

  getFolders(): Promise<Folder[]> {
    let fields = ['id', 'col1'];
    const getWebRequest: GetWebRequest = {
      endPoint: 'trade_folder',
      options: {
        fields: fields
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then(result => result.map(x => this.formatFolder(x)));
  }

  private formatFolder(result: any): Folder {
    let id = parseInt(result.id);
    return new Folder(!isNaN(id) ? id : null, result.col1);
  }

  saveFolder(
    col1: string,
    col2: string,
    col3: string,
    col4: string,
    col5: string
  ): Promise<any> {
    const postWebRequest: PostWebRequest = {
      endPoint: 'trade_request_custom',
      payload: {
        Col1: col1,
        Col2: col2,
        Col3: col3,
        Col4: col4,
        Col5: col5
      }
    };

    return this.wsp.post(postWebRequest);
  }

  updateFolder(
    id: number,
    col1: string,
    col2: string,
    col3: string,
    col4: string,
    col5: string
  ): Promise<any> {
    const putWebRequest: PutWebRequest = {
      endPoint: 'trade_request_custom',
      payload: {
        id: id,
        Col1: col1,
        Col2: col2,
        Col3: col3,
        Col4: col4,
        Col5: col5
      }
    };
    return this.wsp.put(putWebRequest);
  }

  confirmDeleteForFolder(id: number): Promise<any> {
    let fields = ['id'];
    const getWebRequest: GetWebRequest = {
      endPoint: 'trade_requests',
      options: {
        fields: fields,
        filters: [
          {
            key: 'customattribid',
            type: 'EQ',
            value: [id.toString()]
          }
        ]
      }
    };
    return this.wsp.get(getWebRequest);
  }

  deleteFolder(id: number): Promise<any> {
    const deleteWebRequest: DeleteWebRequest = {
      endPoint: 'trade_request_custom',
      payload: {
        id: id.toString()
      }
    };

    return this.wsp.delete(deleteWebRequest);
  }


  getCustomAttribList(): Promise<CustomAttributeOMS[]> {
    let fields = ['ColName', 'ColMappedTo'];
    const getWebRequest: GetWebRequest = {
      endPoint: 'trade_req_custom_col_client_map',
      options: {
        fields: fields
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then(result => result.map(x => this.formatCustomAttribute(x)));
  }

  private formatCustomAttribute(result: any): CustomAttributeOMS {
    let id = parseInt(result.id);
    return new CustomAttributeOMS(
      !isNaN(id) ? id : null,
      result.colname,
      result.colmappedto
    );
  }

  getAllCustomValues(): Promise<any[]> {
    let fields = ['Col1', 'Col2', 'Col3', 'Col4', 'Col5'];
    const getWebRequest: GetWebRequest = {
      endPoint: 'trade_request_custom',
      options: {
        fields: fields
      }
    };
    return this.wsp.get(getWebRequest);
  }
}
