import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Account } from '@pnkl-frontend/shared';
import { AssetType } from '@pnkl-frontend/shared';
import { PnlCalculatedColumnSelection } from '../../shared/pnl-ui-state/store';

@Component({
  selector: 'pnl-calculated-filter',
  templateUrl: './pnl-calculated-filter.component.html',
  styleUrls: ['./pnl-calculated-filter.component.scss']
})
export class PnlCalculatedFilterComponent {
  @Input() accounts: Account[];
  @Input() filterVisible: boolean;
  @Input() pnlCalculatedColumnSelections: PnlCalculatedColumnSelection[];
  @Input() pnlStartDate: Date;
  @Input() pnlEndDate: Date;
  @Input() assetTypes: AssetType[];
  @Input() isDiscardedSecuritesVisible = false;
  @Input() isStartDateVisible = false;
  @Input() selectedAccount: Account;
  @Output() onAdd: EventEmitter<string> = new EventEmitter<string>();
  @Output() onApply: EventEmitter<any> = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();
  @Output() onRemove: EventEmitter<string> = new EventEmitter<string>();
}
