export interface RecommendedAction {
  id: number;
  actionSupressedAt: Date;
  actionType: string;
  dismissAfterProcessing: boolean;
  name: string;
  redirectURL: string;
  timeFrameStart?: Date;
  timeFrameEnd?: Date;
  webRequestAction: string;
  webRequestMessage: string;
  userId: string;
}
