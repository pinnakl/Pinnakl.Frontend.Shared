import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { UserService } from '@pnkl-frontend/core';
import { FILE_SERVICE_URL } from '../enviroment.tokens';
import { ClientFile } from '../models/client-file.model';

export let fileUrl = { url: '' };

let _fileServiceURL = '';

export function setFileServiceURL(url: string): void {
  _fileServiceURL = url;
}

type ClientFileFromApi = ClientFile & {
  createDate: string;
  updateDate: string;
};

interface UploadArguments {
  file: File;
  osType: string;
  osTypeId?: number;
}

@Injectable()
export class FileService {
  constructor(
    private _http: HttpClient,
    private _userService: UserService,
    @Inject(FILE_SERVICE_URL) private _RESOURCE_URL: string
  ) {
    if (this._RESOURCE_URL === '') {
      this._RESOURCE_URL = fileUrl.url;
    }
  }

  async delete(id: number): Promise<void> {
    const requestUrl = `${this._RESOURCE_URL}Delete/${id}`;
    const headers = this._createHeaders();
    await this._http.get(requestUrl, { headers }).toPromise();
  }

  async download(id: number): Promise<string> {
    const requestUrl = `${this._RESOURCE_URL}Download/${id}`;
    const headers = this._createHeaders();
    const httpResponse = await this._http
      .get(requestUrl, { headers, observe: 'response', responseType: 'blob' })
      .toPromise();
    const blob = httpResponse.body;
    const fileUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.setAttribute('href', fileUrl);
    const fileName: string = httpResponse.headers.get('fileName');
    anchor.setAttribute('download', fileName);
    anchor.click();
    return fileName;
  }

  async getFileSize(id: number): Promise<number> {
    const requestUrl = `${this._RESOURCE_URL}GetFileSize/${id}`;
    const headers = this._createHeaders();
    const httpResponse = await this._http
      .get(requestUrl, { headers })
      .toPromise();
    return parseInt(String(httpResponse));
  }

  async getMany({
    osType,
    osTypeId,
    taskInstanceQueueId
  }: {
    osType?: string;
    osTypeId?: number;
    taskInstanceQueueId?: number;
  }): Promise<ClientFile[]> {
    const filters = [];
    if (osType) {
      filters.push(`osType=${osType}`);
    }
    if (osTypeId) {
      filters.push(`osTypeId=${osTypeId}`);
    }
    if (taskInstanceQueueId) {
      filters.push(`taskInstanceQueueId=${taskInstanceQueueId}`);
    }
    if (!filters.length) {
      throw new Error('Invalid filters');
    }
    const criteria = filters.length === 1 ? filters[0] : filters.join('&');
    const url = `${this._RESOURCE_URL}GetMany?${criteria}`;
    const headers = this._createHeaders();
    const clientFiles = await this._http
      .get<ClientFileFromApi[]>(url, { headers })
      .toPromise();
    return clientFiles.map(this._formatClientFile);
  }

  async upload({
    file,
    osType,
    osTypeId
  }: UploadArguments): Promise<ClientFile> {
    const url = `${this._RESOURCE_URL}Upload`;
    const formData = this._createUploadFormData({ file, osType, osTypeId });
    const headers = this._createHeaders();
    const clientFile = await this._http
      .post<ClientFileFromApi>(url, formData, { headers })
      .toPromise();
    return this._formatClientFile(clientFile);
  }

  private _createHeaders(): HttpHeaders {
    const { token } = this._userService.getUser();
    const httpHeaders = new HttpHeaders({ token });
    return httpHeaders;
  }

  private _createUploadFormData({
    file,
    osType,
    osTypeId
  }: UploadArguments): FormData {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('osType', osType);
    if (osTypeId) {
      formData.append('osTypeId', osTypeId.toString());
    }
    return formData;
  }

  private _formatClientFile(entityFromApi: ClientFileFromApi): ClientFile {
    return {
      ...entityFromApi,
      createDate: new Date(entityFromApi.createDate),
      updateDate: entityFromApi.updateDate
        ? new Date(entityFromApi.updateDate)
        : null
    };
  }
}
