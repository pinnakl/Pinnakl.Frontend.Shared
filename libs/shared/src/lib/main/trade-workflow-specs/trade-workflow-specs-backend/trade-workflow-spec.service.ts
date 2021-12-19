import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { TradeWorkflowSpecFromApi } from './trade-workflow-spec-from-api.model';
import { TradeWorkflowSpec } from './trade-workflow-spec.model';

@Injectable()
export class TradeWorkflowSpecService {
  private readonly _tradeWorkflowSpecsEndpoint = 'trade_workflow_specs';

  constructor(private readonly _wsp: WebServiceProvider) {}

  async getAll(): Promise<TradeWorkflowSpec[]> {
    const entitiesFromApi: TradeWorkflowSpecFromApi[] = await this._wsp.getHttp<TradeWorkflowSpecFromApi[]>({
      endpoint: this._tradeWorkflowSpecsEndpoint,
      params: {
        fields: [
          'clientId',
          'id',
          'listedExecution',
          'manualApproval',
          'nonlistedFills',
          'realTimePortfolio'
        ]
      }
    });
    return _formatEntities(entitiesFromApi);
  }
}

function _formatEntities(
  entities: TradeWorkflowSpecFromApi[]
): TradeWorkflowSpec[] {
  return entities.map(_formatEntity);
}

function _formatEntity({
  clientid,
  id,
  calcaum,
  listedexecution,
  manualapproval,
  nonlistedfills,
  realtimeportfolio,
  rebalancebpsadjvisible
}: TradeWorkflowSpecFromApi): TradeWorkflowSpec {
  return {
    clientId: +clientid,
    id: +id,
    calcAum: calcaum === 'True',
    listedExecution: listedexecution === 'True',
    manualApproval: manualapproval === 'True',
    nonlistedFills: nonlistedfills === 'True',
    realTimePortfolio: realtimeportfolio === 'True',
    rebalanceBpsAdjVisible: rebalancebpsadjvisible === 'True'
  };
}
