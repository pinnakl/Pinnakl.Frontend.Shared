import { Component, OnInit } from '@angular/core';
import { CustomAttribute, CustomAttributeValue } from '../../..';
import { CachingService, CrmOptions } from '../../../investor';

@Component({
  selector: 'app-add-button-select',
  templateUrl: './add-button-select.component.html',
  styleUrls: ['./add-button-select.component.scss']
})
export class AddButtonSelectComponent implements OnInit {

  constructor(private readonly cachingService: CachingService) {}
  oppenedMenu = false;
  showContactModal = false;
  crmOptions: CrmOptions;
  customAttributes: CustomAttribute[];
  customAttributeValues: CustomAttributeValue[];

  ngOnInit() {
    this.cachingService.getCrmOptions().then(crmO => {
      this.crmOptions = crmO;
    })
  }
  openSelectMenu() {
    this.oppenedMenu = !this.oppenedMenu;
  }

  onEditorClose() {
    this.showContactModal = false;
  }

  openContactModal() {
    this.oppenedMenu = false;
    this.showContactModal = !this.showContactModal
  }
}
