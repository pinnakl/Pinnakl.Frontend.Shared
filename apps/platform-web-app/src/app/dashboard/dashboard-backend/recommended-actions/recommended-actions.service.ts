import { Injectable } from '@angular/core';

import * as moment from 'moment';

import {
  UserService,
  WebServiceProvider
} from '@pnkl-frontend/core';
import { RecommendedActionFromApi } from './recommended-action-from-api.model';
import { RecommendedAction } from './recommended-action.model';

@Injectable()
export class RecommendedActionsService {
  private readonly _recommendedActionsEndpoint = 'entities/recommended_actions';
  constructor(
    private readonly wsp: WebServiceProvider,
    private readonly userService: UserService
  ) { }

  async get(): Promise<RecommendedAction[]> {
    const now = moment()
      .utc()
      .format('MM/DD/YYYY hh:mm:ss a');
    const recommendedActions = await this.wsp.getHttp<RecommendedActionFromApi[]>({
      endpoint: this._recommendedActionsEndpoint,
      params: {
        fields: [
          'id',
          'name',
          'redirectURL',
          'webRequestMessage',
          'webRequestAction',
          'actionSupressedAt',
          'timeframeStart',
          'timeFrameEnd',
          'dismissAfterProcessing',
          'userid',
          'recommendedActionType'
        ],
        filters: [
          {
            key: 'userid',
            type: 'EQ',
            value: [this.userService.getUser().id.toString()]
          },
          {
            key: 'TimeFrameStart',
            type: 'LE',
            value: [now]
          },
          {
            key: 'TimeFrameEnd',
            type: 'GE',
            value: [now]
          }
        ]
      }
    });
    return recommendedActions.map(this.formatRecommendedAction);
  }

  async put(action: Partial<RecommendedAction>): Promise<RecommendedAction> {
    const result = await this.wsp.putHttp<RecommendedActionFromApi>({
      endpoint: this._recommendedActionsEndpoint,
      body: this.getRecommendedActionForServiceRequest(action)
    });
    return this.formatRecommendedAction(result);
  }

  private formatRecommendedAction(
    entityFromAPI: RecommendedActionFromApi
  ): RecommendedAction {
    const supressDate = moment.utc(
      entityFromAPI.actionsupressedat,
      'MM-DD-YYYY hh:mm:ss a'
    );
    const timeFrameEnd = moment.utc(
      entityFromAPI.timeframeend,
      'MM-DD-YYYY hh:mm:ss a'
    );
    const timeFrameStart = moment.utc(
      entityFromAPI.timeframestart,
      'MM-DD-YYYY hh:mm:ss a'
    );
    return {
      id: +entityFromAPI.id,
      dismissAfterProcessing: entityFromAPI.dismissafterprocessing === 'True',
      actionSupressedAt: supressDate.isValid() ? supressDate.toDate() : null,
      name: entityFromAPI.name,
      redirectURL: entityFromAPI.redirecturl,
      timeFrameEnd: timeFrameEnd.isValid() ? timeFrameEnd.toDate() : null,
      timeFrameStart: timeFrameStart.isValid() ? timeFrameStart.toDate() : null,
      webRequestMessage: entityFromAPI.webrequestmessage,
      webRequestAction: entityFromAPI.webrequestaction,
      actionType: entityFromAPI.recommendedactiontype
    } as RecommendedAction;
  }

  private getRecommendedActionForServiceRequest(
    entity: Partial<RecommendedAction>
  ): RecommendedActionFromApi {
    const entityForApi = {} as RecommendedActionFromApi,
      { id, actionSupressedAt, timeFrameEnd } = entity;
    if (actionSupressedAt !== undefined) {
      entityForApi.actionsupressedat = actionSupressedAt
        ? moment(actionSupressedAt)
            .utc()
            .format('MM/DD/YYYY hh:mm:ss a')
        : 'null';
    }
    if (timeFrameEnd !== undefined) {
      entityForApi.timeframeend = timeFrameEnd
        ? moment(timeFrameEnd)
            .utc()
            .format('MM/DD/YYYY hh:mm:ss a')
        : 'null';
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    return entityForApi;
  }
}
