import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { MarketIdentifier } from './market-identifier.model';

@Pipe({ name: 'sortMarketIdentifiers', pure: false })
export class SortMarketIdentifiers implements PipeTransform {
  transform(identifiers: MarketIdentifier[]): MarketIdentifier[] {
    return _.orderBy(
      identifiers,
      ['securityMarket', 'securityMarket.primaryMarketIndicator'],
      ['desc', 'desc']
    );
  }
}
