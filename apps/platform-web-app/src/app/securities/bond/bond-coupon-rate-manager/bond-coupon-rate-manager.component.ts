import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ValueHistoryItem } from '@pnkl-frontend/shared';
import { BondCoupon } from '@pnkl-frontend/shared';
import { BondCouponService } from '@pnkl-frontend/shared';

@Component({
  selector: 'bond-coupon-rate-manager',
  templateUrl: './bond-coupon-rate-manager.component.html',
  styleUrls: ['./bond-coupon-rate-manager.component.scss']
})
export class BondCouponRateManagerComponent {
  @Input() bondId: number;
  @Output() onClose = new EventEmitter<void>();
  @Output() onCouponChange = new EventEmitter<number>();
  constructor(private readonly bondCouponService: BondCouponService) {
    this.getCouponRates = this.getCouponRates.bind(this);
    this.saveCouponRates = this.saveCouponRates.bind(this);
  }

  async getCouponRates(): Promise<ValueHistoryItem[]> {
    const couponRates = await this.bondCouponService.getCoupons(this.bondId);
    return couponRates.map(({ coupon, ...rest }) => ({
      ...rest,
      value: coupon
    }));
  }

  async saveCouponRates(toSave: {
    add: ValueHistoryItem[];
    delete: ValueHistoryItem[];
    update: ValueHistoryItem[];
  }): Promise<void> {
    const transform = ({ value, ...rest }: ValueHistoryItem): BondCoupon => <BondCoupon>{
        ...rest,
        coupon: value
      };
    await this.bondCouponService.saveMany({
      add: toSave.add.map(x => ({ ...transform(x), bondId: this.bondId })),
      delete: toSave.delete.map(transform),
      update: toSave.update.map(transform)
    });
  }
}
