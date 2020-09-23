import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import * as moment from 'moment';

import { PostWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { RecommendedAction } from '../recommended-actions/recommended-action.model';

@Injectable()
export class RecommendedActionsProcessingService {
  private readonly ACTION_ACTIVITY_RESOURCE_URL =
    'recommended_action_activities';
  private readonly DATE_TIME_FORMAT = 'MM/DD/YYYY hh:mm:ss a';
  constructor(private router: Router, private wsp: WebServiceProvider) {}

  async process(action: RecommendedAction): Promise<any> {
    if (action.redirectURL) {
      this.router.navigate([]).then(result => {
        window.open(action.redirectURL, '_blank');
      });
      this.logActionActivity(action.id);
      return true;
    }

    let webRequestMessage = this.getWebRequestMessage(action);
    if (action.webRequestAction.toLowerCase() === 'post') {
      await this.wsp.post(webRequestMessage);
      this.logActionActivity(action.id);
      return true;
    }
    if (action.webRequestAction.toLowerCase() === 'put') {
      await this.wsp.put(webRequestMessage);
      this.logActionActivity(action.id);
      return true;
    }
  }

  private logActionActivity(actionId: number): Promise<any> {
    let webRequest: PostWebRequest = {
      endPoint: this.ACTION_ACTIVITY_RESOURCE_URL,
      payload: {
        recommendedactionid: actionId.toString(),
        processedat: moment()
          .utc()
          .format(this.DATE_TIME_FORMAT)
      }
    };
    return this.wsp.post(webRequest);
  }

  private getWebRequestMessage(action: RecommendedAction): any {
    let webMessageString = action.webRequestMessage
      .replace('{todayWithTime}', `${moment().format(this.DATE_TIME_FORMAT)}`)
      .replace('{today}', `${moment().format('MM/DD/YYYY')}`);
    let webRequestMessage = JSON.parse(webMessageString);
    return webRequestMessage;
  }
}
