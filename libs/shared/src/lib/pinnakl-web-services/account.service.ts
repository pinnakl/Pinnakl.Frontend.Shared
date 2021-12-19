import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { Account } from '../models';
import { AdminAccountFromApi } from '../models/admin-account-from-api.model';
import { AdminAccount } from '../models';
import { AdminFromApi } from '../models/admin-from-api.model';
import { Admin } from '../models/admin.model';

@Injectable()
export class AccountService {
  private readonly ADMINS_URL = 'entities/admins';
  private readonly ADMIN_ACCOUNTS_URL = 'entities/admin_accounts';
  private readonly ACCOUNTS_URL = 'entities/accounts';
  private _accounts: Account[];
  constructor(private wsp: WebServiceProvider) {}

  getAdmins(): Promise<Admin[]> {
    return this.wsp
      .getHttp<AdminFromApi[]>({
        endpoint: this.ADMINS_URL,
        params: {
          fields: ['Code', 'Id', 'Name']
        }
      })
      .then(entities => entities.map(this.formatAdmin));
  }

  getAdminAccounts(): Promise<AdminAccount[]> {
    return this.wsp
      .getHttp<AdminAccountFromApi[]>({
        endpoint: this.ADMIN_ACCOUNTS_URL,
        params: {
          fields: ['Id', 'AccountId', 'AccountCode', 'AdminId', 'AdminCode']
        }
      }).then(adminAccounts => adminAccounts.map(this.formatAdminAccount));
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

    return this.wsp.getHttp<any[]>({
      endpoint: this.ACCOUNTS_URL,
      params: {
        fields: [
          'AccountCode',
          'AccountNum',
          'Name',
          'IsPrimaryForReturns',
          'OrderOfImportance'
        ]
      }
    }).then(accounts => accounts.map(this.formatAccount));
  }

  public formatAccount(item: any): Account {
    return new Account(
      item.id,
      item.accountcode,
      item.accountnum,
      item.name,
      item.isprimaryforreturns === 'True',
      item.orderofimportance
    );
  }
}
