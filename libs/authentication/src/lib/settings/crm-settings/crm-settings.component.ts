import { Component, OnInit } from '@angular/core';

import { PinnaklSpinner, Toastr, UserService } from '../../../../../core/src';

@Component({
  selector: 'crm-settings',
  templateUrl: './crm-settings.component.html',
  styleUrls: ['./crm-settings.component.scss']
})
export class CrmSettingsComponent implements OnInit {
  blockedIps: any[] = [];

  newBlockedIp = '';
  constructor(
    private readonly _crmSettingsService: UserService,
    private readonly _spinner: PinnaklSpinner,
    private readonly _toastr: Toastr) {
    }

  ngOnInit(): void {
    this.loadBlockedIps();
  }

  removeEntity(item): void {
    this._spinner.spin();
    this._crmSettingsService.removeBlockedIps(item.id).then(() => {
      this.loadBlockedIps();
      this._toastr.success(`IP address ${item.ipaddress} deleted`);
    }).catch(() => {
      this._spinner.stop();
      this._toastr.error('Error in changing');
    });
  }

  addEntity() {
    if(this.checkValidNewIp()) {
      this._spinner.spin();
      this._crmSettingsService.postBlockedIps({ipaddress: this.newBlockedIp}).then(() => {
        this.loadBlockedIps();
        this._toastr.success(`IP address ${this.newBlockedIp} added`);
        this.newBlockedIp = '';
      }).catch(() => {
        this._spinner.stop();
        this._toastr.error('Error in changing');
      });
    }
    
  }

  private loadBlockedIps(): void {
    this._spinner.spin();
    this._crmSettingsService.getBlockedIps().then(ips =>{
      this.blockedIps = ips;
      this._spinner.stop();
    })
  }

  checkValidNewIp() {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(this.newBlockedIp))
    {
      return true;
    } else {
      return false;
    }
  }
}
