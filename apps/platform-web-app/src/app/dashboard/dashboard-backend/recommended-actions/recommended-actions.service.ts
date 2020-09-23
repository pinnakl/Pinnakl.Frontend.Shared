import { Injectable } from '@angular/core';

import * as moment from 'moment';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import {
  GetWebRequest,
  SubscriptionResponse,
  UserService,
  WebServiceProvider
} from '@pnkl-frontend/core';
import { RecommendedActionFromApi } from './recommended-action-from-api.model';
import { RecommendedAction } from './recommended-action.model';

@Injectable()
export class RecommendedActionsService {
  private readonly RESOURCE_URL = 'recommended_actions';
  constructor(
    private wsp: WebServiceProvider,
    private userService: UserService
  ) {}

  async get(): Promise<RecommendedAction[]> {
    const now = moment()
      .utc()
      .format('MM/DD/YYYY hh:mm:ss a');
    let webRequestMessage: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
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
    };
    const recommendedActions = await this.wsp.get(webRequestMessage);
    return recommendedActions.map(entity =>
      this.formatRecommendedAction(entity)
    );
  }

  subscribeToRecommendedActions(): Observable<
    SubscriptionResponse<RecommendedAction>
  > {
    return this.wsp.subscribe(this.RESOURCE_URL).pipe(
      filter(
        (result: SubscriptionResponse<RecommendedActionFromApi>) =>
          result.body.userid !== this.userService.getUser().id.toString()
      ),
      map((result: SubscriptionResponse<RecommendedActionFromApi>) => {
        let response = new SubscriptionResponse<RecommendedAction>();
        response.action = result.action;
        response.body = this.formatRecommendedAction(result.body);
        return response;
      })
    );
  }

  async put(action: Partial<RecommendedAction>): Promise<RecommendedAction> {
    let requestForAPI = this.getRecommendedActionForServiceRequest(action);
    const result = await this.wsp.put({
      endPoint: this.RESOURCE_URL,
      payload: requestForAPI
    });
    return this.formatRecommendedAction(result);
  }

  private formatRecommendedAction(
    entityFromAPI: RecommendedActionFromApi
  ): RecommendedAction {
    let supressDate = moment.utc(
      entityFromAPI.actionsupressedat,
      'MM-DD-YYYY hh:mm:ss a'
    );
    let timeFrameEnd = moment.utc(
      entityFromAPI.timeframeend,
      'MM-DD-YYYY hh:mm:ss a'
    );
    let timeFrameStart = moment.utc(
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
    let entityForApi = {} as RecommendedActionFromApi,
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
