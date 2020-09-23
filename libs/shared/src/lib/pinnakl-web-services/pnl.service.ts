import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { PnlDiscardedExtDataId } from './../models/pnl-discarded-pnlextdataids.model';
import { PnlDiscardedPrimaryId } from './../models/pnl-discarded-primaryids.model';
import { PnL } from './../models/pnl.model';

@Injectable()
export class PnlService {
  constructor(private wsp: WebServiceProvider) {}
  PNL_USER_INTERACTIVE_DATA = '/pnl_user_interactive_data';

  getPnlData(pnlaccount: string, date: Date): Promise<PnL[]> {
    let pnlDateString = moment(date).format('MM/DD/YYYY');
    const fields = [
        'AccountId',
        'AssetType',
        'Ticker',
        'Description',
        'Quantity',
        'Price',
        'Mtd_Pnl',
        'Daily_Pnl',
        'Ytd_Pnl',
        'PrimaryId',
        'Id1',
        'Id2',
        'Id3',
        'FolderCode',
        'PnlType',
        'PnklSecIdForCashPnl'
      ],
      getWebRequest: GetWebRequest = {
        endPoint: 'pnl_processed',
        options: {
          fields,
          filters: [
            { key: 'AccountId', type: 'EQ', value: [pnlaccount] },
            { key: 'pnldate', type: 'EQ', value: [pnlDateString] }
          ]
        }
      };
    return this.wsp.get(getWebRequest).then(pnlData => {
      return pnlData.map(x => {
        return new PnL(
          parseFloat(x.id),
          parseFloat(x.userinteractivedataid),
          x.assettype.toUpperCase(),
          x.ticker.toUpperCase(),
          x.description,
          parseFloat(x.quantity),
          parseFloat(x.price),
          parseFloat(x.daily_pnl),
          parseFloat(x.mtd_pnl),
          parseFloat(x.ytd_pnl),
          x.primaryid,
          x.id1,
          x.id2,
          x.id3,
          parseFloat(x.pnklsecidforcashpnl),
          parseFloat(x.securityid),
          parseFloat(x.accountid),
          parseFloat(x.actcustomattrid),
          x.extfoldercode,
          x.foldercode,
          x.pnltype
        );
      });
    });
  }

  getLastRunPnlDateByAccount(pnlaccount: string): Promise<any> {
    const fields = ['pnldate'],
      getWebRequest: GetWebRequest = {
        endPoint: 'raw_pnl_data',
        options: {
          fields,
          filters: [
            { key: 'account', type: 'EQ', value: [pnlaccount] },
            {
              key: '',
              type: 'TOP',
              value: ['1']
            }
          ],
          orderBy: [{ field: 'PnlDate', direction: 'DESC' }]
        }
      };
    return this.wsp.get(getWebRequest).then(result => {
      if (result.length > 0) {
        return result[0].pnldate;
      } else {
        return null;
      }
    });
  }

  getLastRunPnLDate(date: Date): Promise<any> {
    let pnlDateString = moment(date).format('MM/DD/YYYY');
    const fields = ['pnldate'],
      getWebRequest: GetWebRequest = {
        endPoint: 'raw_pnl_data',
        options: {
          fields,
          filters: [
            { key: 'pnlDate', type: 'LE', value: [pnlDateString] },
            {
              key: '',
              type: 'TOP',
              value: ['1']
            }
          ],
          orderBy: [{ field: 'PnlDate', direction: 'DESC' }]
        }
      };
    return this.wsp.get(getWebRequest).then(result => {
      if (result.length > 0) {
        return result[0].pnldate;
      } else {
        return null;
      }
    });
  }

  discardExtSecId(pnlExtIds: PnlDiscardedExtDataId): Promise<any> {
    return this.wsp.post({
      endPoint: 'pnl_discarded_by_pnlid',
      payload: {
        pnlextdataid: pnlExtIds.pnlextdataid,
        accountid: pnlExtIds.accountid,
        discarddate: new Date().toLocaleDateString('en-US')
      }
    });
  }

  enableExtSecId(pnlExtIds: PnlDiscardedExtDataId): Promise<any> {
    return this.wsp.delete({
      endPoint: '/pnl_discarded_by_pnlid',
      payload: pnlExtIds
    });
  }

  getDiscardedPnlExtDataIds(): Promise<any> {
    const getWebRequest: GetWebRequest = {
      endPoint: 'pnl_discarded_by_pnlid',
      options: { fields: ['AccountId', 'PnlExtDataId'] }
    };
    return this.wsp.get(getWebRequest).then(discardedIds => {
      return discardedIds.map(x => {
        return new PnlDiscardedExtDataId(
          parseFloat(x.id),
          parseFloat(x.pnlextdataid),
          parseFloat(x.accountid)
        );
      });
    });
  }

  getDiscardedPrimaryIds(): Promise<any> {
    return this.wsp
      .get({
        endPoint: 'pnl_discarded_by_extprimaryid',
        options: {
          fields: ['ExtPrimaryId', 'ExtId1', 'ExtId2', 'ExtId3', 'AccountId']
        }
      })
      .then(discardedIds => {
        return discardedIds.map(x => {
          return new PnlDiscardedPrimaryId(
            x.extprimaryid,
            x.extid1,
            x.extid2,
            x.extid3,
            parseFloat(x.accountid)
          );
        });
      });
  }

  updatePnlUserInteractiveData(pnlRowToUpdate: any): Promise<any> {
    return this.wsp.put({
      endPoint: this.PNL_USER_INTERACTIVE_DATA,
      payload: pnlRowToUpdate
    });
  }
}
