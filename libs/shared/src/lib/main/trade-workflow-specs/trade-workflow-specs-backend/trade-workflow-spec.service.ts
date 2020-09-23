import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { TradeWorkflowSpecFromApi } from './trade-workflow-spec-from-api.model';
import { TradeWorkflowSpec } from './trade-workflow-spec.model';

@Injectable()
export class TradeWorkflowSpecService {
  private readonly _FIELDS = [
    'clientId',
    'id',
    'listedExecution',
    'manualApproval',
    'nonlistedFills',
    'realTimePortfolio'
  ];
  private readonly _RESOURCE_URL = 'trade_workflow_specs';

  constructor(private _wsp: WebServiceProvider) {}

  async getAll(): Promise<TradeWorkflowSpec[]> {
    const entitiesFromApi: TradeWorkflowSpecFromApi[] = await this._wsp.get({
      endPoint: this._RESOURCE_URL,
      options: {
        fields: this._FIELDS
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
  listedexecution,
  manualapproval,
  nonlistedfills,
  realtimeportfolio
}: TradeWorkflowSpecFromApi): TradeWorkflowSpec {
  return {
    clientId: +clientid,
    id: +id,
    listedExecution: listedexecution === 'True',
    manualApproval: manualapproval === 'True',
    nonlistedFills: nonlistedfills === 'True',
    realTimePortfolio: realtimeportfolio === 'True'
  };
}
