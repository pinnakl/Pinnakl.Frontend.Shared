import { AfterViewInit, Component } from '@angular/core';

import { PinnaklSpinner, WebServiceProvider } from '@pnkl-frontend/core';

@Component({
  selector: 'api-playground-home',
  templateUrl: './api-playground-home.component.html',
  styleUrls: ['./api-playground-home.component.scss']
})
export class ApiPlaygroundHomeComponent {
  interval;
  count = 0;
  apiActionError = false;
  apiActionArrayResult = [];
  apiActionResult: any = {};
  from = 20;
  to = 40;
  constructor(
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly wsp: WebServiceProvider
  ) {}

  async doSomething(): Promise<void> {
    // const eventData = {
    //   event_description: 'Assignment on 21 January CALL on JNJ',
    //   event_source_id: '3',
    //   event_type_id: '6',
    //   securityid: '2640',
    //   payment_date: '4/4/2021',
    //   record_date: '4/4/2021',
    //   event_sub_type: 'Exercise',
    //   underlying_security_id: '2445',
    //   underlying_price: '40.66'
    // };
    // const postRet = await this.wsp.postHttp({
    //   endpoint: 'entities/corporate_action_events',
    //   body: eventData
    // });

    const ret = await this.wsp.getHttp({
      endpoint: 'entities/validate_mail_merge_keyword',
      params: {
        filters: [
          {
            key: 'communicationid',
            type: 'EQ',
            value: ['369019 ']
          }
        ]
      }
    });

    console.log('Returned from post', ret);
  }

  private async performAsyncAction(action: () => Promise<any>): Promise<void> {
    try {
      this.pinnaklSpinner.spin();
      this.apiActionResult = await action();
      this.apiActionError = false;
    } catch (e) {
      this.apiActionResult = e;
      this.apiActionError = true;
    } finally {
      this.pinnaklSpinner.stop();
    }
  }

  sseTesting(shouldStart: boolean): void {
    if (shouldStart) {
      let i = 0;
      this.wsp.postHttp({
        endpoint: 'entities/sse_testing',
        body: {
          something: (++i).toString()
        }
      });

      this.interval = setInterval(() => {
        if (i < 10) {
          this.wsp.postHttp({
            endpoint: 'entities/sse_testing',
            body: {
              something: (++i).toString()
            }
          });
        } else {
          clearInterval(this.interval);
        }
      }, 5000);
    } else {
      clearInterval(this.interval);
    }
  }

  clearEvents(): void {
    this.apiActionArrayResult = [];
  }
}
