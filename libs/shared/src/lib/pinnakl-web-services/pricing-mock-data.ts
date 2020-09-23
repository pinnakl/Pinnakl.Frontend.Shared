import {
  Position,
  PositionNew,
  Price,
  PricingSource
} from '../models/pricing.model';
import { AssetType } from '../models/security/asset-type.model';

export const portfolio: Position[] = [
  new Position(
    'BANKDEBT',
    -1.0,
    '',
    '',
    'Cirque Du Soleil 2nd Liend',
    'BL1742610',
    99.0,
    100.0,
    'broker',
    '640',
    'CIRQ'
  ),
  new Position(
    'BANKDEBT',
    0.0,
    '',
    '',
    'Citgo Holdings 1l Sr Secd - new',
    'BL1652272',
    100.563,
    100.563,
    'broker',
    '729',
    'CITHOL'
  )
];

export const portfolioNew: PositionNew[] = [
  new PositionNew(
    'BANKDEBT',
    -1.0,
    '',
    '',
    'Cirque Du Soleil 2nd Liend',
    'BL1742610',
    99.0,
    100.0,
    'broker',
    '640',
    'CIRQ',
    [],
    'test'
  ),
  new PositionNew(
    'BANKDEBT',
    0.0,
    '',
    '',
    'Citgo Holdings 1l Sr Secd - new',
    'BL1652272',
    100.563,
    100.563,
    'broker',
    '729',
    'CITHOL',
    [],
    'test'
  )
];

export const assetTypes: AssetType[] = [
  new AssetType(1, 'BANKDEBT', 7, 0.01),
  new AssetType(2, 'BOND', 3, 0.01)
];

export const pricingDate = new Date();

export const prevPricingDate = new Date();

export const prices: Price[] = [
  new Price(
    '',
    '',
    'AUTO',
    '11/10/2017 12:00:00 AM',
    '40426',
    true,
    100.208,
    pricingDate,
    '1426',
    '1',
    'APEX'
  )
];

export const pricingSources: PricingSource[] = [
  new PricingSource(true, '', '1', false, 'APEX'),
  new PricingSource(false, '', '2', false, 'R+')
];
