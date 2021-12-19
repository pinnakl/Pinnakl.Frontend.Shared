import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, } from '@angular/core';

@Component({
  selector: 'pnkl-tab-selector',
  templateUrl: './tab-selector.component.html',
  styleUrls: ['./tab-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabSelectorComponent {
  selectedItem: string;

  private _tabList: string[];
  @Input() set tabList(list: string[]){
    this.selectFirstTab(list);
    this._tabList = list;
  }
  get tabList(): string[] {
    return this._tabList;
  }

  @Output() itemSelected = new EventEmitter<string>();

  itemSelectionHandler(item: string): void {
    this.selectedItem = item;
    this.itemSelected.emit(item);
  }

  private selectFirstTab(list: string[]): void {
    this.selectedItem = list[0];
  }
}
