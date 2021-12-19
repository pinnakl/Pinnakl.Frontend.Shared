import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import { Destroyable, EMSTradeService, Order, RebalanceOrderModel } from '@pnkl-frontend/shared';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { orderBy, SortDescriptor } from '@progress/kendo-data-query';
import { PositionHomeService } from '../position-home/position-home.service';

@Component({
  selector: 'rebalance-orders',
  templateUrl: './rebalance-orders.component.html',
  styleUrls: ['./rebalance-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RebalanceOrdersComponent extends Destroyable implements OnInit {
  @Output() closeModal = new EventEmitter<void>();

  sort: SortDescriptor[] = [];
  gridView: GridDataResult;

  rebalanceOrders: RebalanceOrderModel[] = [];
  selectedRebalanceOrders: RebalanceOrderModel[] = [];

  constructor(
    private readonly positionHomeService: PositionHomeService,
    private readonly emsService: EMSTradeService,
    private readonly spinner: PinnaklSpinner,
    private readonly toastr: Toastr) {
    super();
  }

  get hasSelectedOrders(): boolean {
    return this.rebalanceOrders?.some((order: RebalanceOrderModel) => order.selected);
  }

  ngOnInit(): void {
    this.getRebalanceOrders();
  }

  sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.renderGrid();
  }

  renderGrid(): void {
    this.gridView = {
      data: orderBy(this.rebalanceOrders, this.sort),
      total: this.rebalanceOrders.length
    };
  }

  stageOrders(): void {
    const orders = this.rebalanceOrders.filter((order: RebalanceOrderModel) => order.selected);
    if (!orders.length) {
      return;
    }

    this.spinner.spin();

    const result = orders.map((order: RebalanceOrderModel) => {
      const orderPost = this.createNewOrderModel(order);
      return this.emsService.insertStagedTrade(orderPost).then((orderId: number) =>
        this.emsService.postOrderAllocations(orderId, order.accountCodes));
    });

    Promise.all(result)
      .then(() => {
        this.spinner.stop();
        this.toastr.success(
          `${this.rebalanceOrders.filter((order: RebalanceOrderModel) => order.selected).length} trade(s) have been staged`
        );
        this.positionHomeService.positionsResetOrdersTrigger$.next(true);
        this.closeModal.emit();
      })
      .catch((error: HttpErrorResponse) => {
        this.spinner.stop();
        this.toastr.success('error while stageOrders');
        console.error(error);
      });
  }

  getLongTranType(tranType: string): string {
    let ret = '';
    if (tranType) {
      if (tranType.toLowerCase() === 'b') {
        ret = 'Buy';
      } else if (tranType.toLowerCase() === 'bc') {
        ret = 'Cover';
      } else if (tranType.toLowerCase() === 's') {
        ret = 'Sell';
      } else if (tranType.toLowerCase() === 'ss') {
        ret = 'Short';
      }
    }

    return ret;
  }

  private createNewOrderModel(order: RebalanceOrderModel): Order {
    return new Order(
      null,
      new Date(),
      order.tranType,
      order.security,
      null,
      order.orderQuantity,
      order.type,
      order.tif,
      null,
      order.orderPrice,
      { id: order.security.currencyId, currency: order.security.currency },
      order.broker,
      null,
      null,
      order.orderStatus,
      null
    );
  }

  private getRebalanceOrders(): void {
    this.rebalanceOrders = this.positionHomeService.selectedPositionOrders$.getValue();
    this.renderGrid();
  }
}
