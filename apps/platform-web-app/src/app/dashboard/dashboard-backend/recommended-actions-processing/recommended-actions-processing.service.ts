import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { RecommendedAction } from '../recommended-actions/recommended-action.model';

@Injectable()
export class RecommendedActionsProcessingService {
  private readonly _recommendedActionActivitiesEndpoint =
    'entities/recommended_action_activities';
  private readonly DATE_TIME_FORMAT = 'MM/DD/YYYY hh:mm:ss a';
  constructor(private readonly router: Router, private readonly wsp: WebServiceProvider) {}

  async process(action: RecommendedAction): Promise<any> {
    if (action.redirectURL) {
      this.router.navigate([]).then(result => {
        window.open(action.redirectURL, '_blank');
      });
      this.logActionActivity(action.id);
      return true;
    }

    const webRequestMessage = this.getWebRequestMessage(action);
    if (action.webRequestAction.toLowerCase() === 'post') {
      await this.wsp.postHttp(webRequestMessage);
      this.logActionActivity(action.id);
      return true;
    }
    if (action.webRequestAction.toLowerCase() === 'put') {
      await this.wsp.putHttp(webRequestMessage);
      this.logActionActivity(action.id);
      return true;
    }
  }

  private logActionActivity(actionId: number): Promise<any> {
    return this.wsp.postHttp({
      endpoint: this._recommendedActionActivitiesEndpoint,
      body: {
        recommendedactionid: actionId.toString(),
        processedat: moment()
          .utc()
          .format(this.DATE_TIME_FORMAT)
      }
    });
  }

  private getWebRequestMessage(action: RecommendedAction): any {
    const webMessageString = action.webRequestMessage
      .replace('{todayWithTime}', `${moment().format(this.DATE_TIME_FORMAT)}`)
      .replace('{today}', `${moment().format('MM/DD/YYYY')}`);
    return JSON.parse(webMessageString);
  }
}
