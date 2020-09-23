import { PnlExposure } from './pnl-exposure.model';
import { PositionEventModel } from './position-event.model';
export interface ActivitySummaryModel {
  pnlAssetType: PnlExposure[];
  pnlSector: PnlExposure[];
  positionsAdded: PositionEventModel[];
  positionsExited: PositionEventModel[];
}
