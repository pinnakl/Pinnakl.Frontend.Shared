import { Injectable } from '@angular/core';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { Account } from '../models/account.model';
import { AdminAccountFromApi } from '../models/admin-account-from-api.model';
import { AdminAccount } from '../models/admin-account.model';
import { AdminFromApi } from '../models/admin-from-api.model';
import { Admin } from '../models/admin.model';

@Injectable()
export class AccountService {
  private readonly ADMINS_URL = 'admins';
  private readonly ADMIN_ACCOUNTS_URL = 'admin_accounts';
  private readonly ACCOUNTS_URL = 'accounts';
  private _accounts: Account[];
  constructor(private wsp: WebServiceProvider) {}

  getAdmins(): Promise<Admin[]> {
    let fields = ['Code', 'Id', 'Name'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.ADMINS_URL,
      options: {
        fields: fields
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((entities: AdminFromApi[]) =>
        entities.map(entity => this.formatAdmin(entity))
      );
  }

  getAdminAccounts(): Promise<AdminAccount[]> {
    let fields = ['Id', 'AccountId', 'AccountCode', 'AdminId', 'AdminCode'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.ADMIN_ACCOUNTS_URL,
      options: {
        fields: fields
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((adminAccounts: AdminAccountFromApi[]) =>
        adminAccounts.map(adminAccount => this.formatAdminAccount(adminAccount))
      );
  }

  private formatAdmin(entity: AdminFromApi): Admin {
    let id = parseInt(entity.id);
    return new Admin(entity.code, !isNaN(id) ? id : null, entity.name);
  }

  private formatAdminAccount(account: AdminAccountFromApi): AdminAccount {
    let accountId = parseInt(account.accountid),
      adminId = parseInt(account.adminid),
      id = parseInt(account.id);
    return new AdminAccount(
      account.accountcode,
      !isNaN(accountId) ? accountId : null,
      account.admincode,
      !isNaN(adminId) ? adminId : null,
      !isNaN(id) ? id : null
    );
  }

  getAccounts(): Promise<Account[]> {
    if (this._accounts) {
      return Promise.resolve(this._accounts);
    }

    let fields = [
      'AccountCode',
      'AccountNum',
      'Name',
      'IsPrimaryForReturns',
      'OrderOfImportance'
    ];
    const getWebRequest: GetWebRequest = {
      endPoint: this.ACCOUNTS_URL,
      options: {
        fields: fields
      }
    };

    return this.wsp.get(getWebRequest).then(accounts => {
      this._accounts = accounts.map(x => {
        return new Account(
          x.id,
          x.accountcode,
          x.accountnum,
          x.name,
          x.isprimaryforreturns === 'True' ? true : false,
          x.orderofimportance
        );
      });
      return this._accounts;
    });
  }
}
