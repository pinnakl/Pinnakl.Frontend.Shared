import { Component } from '@angular/core';

@Component({
  selector: 'ci-documentation',
  template: `
    <module-documentation #parent>
    <div>
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12"><h1>CRM App</h1></div>
          </div>
          <div class="row">
            <div class="col-md-12">
                CRM app has <a href="https://share.getcloudapp.com/YEudY8rD" target="_blank">2 main screens</a> -- CRM and Reporting. Within CRM there are 7 tabs (three of these are most relevant for your free trial and are discussed below). Reporting has various canned reports. If you get an error or get stuck, hit page refresh.
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12"><h2>Dashboard</h2></div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <ol>
                <li><a href="https://share.getcloudapp.com/NQuvmvGY"  target="_blank">Organization by Category and Organization by status (D1) </a>– Bar charts show organization breakdown by category and sales stage, respectively. Information can be edited through individual organization pages.</li>
                <li><a href="https://share.getcloudapp.com/NQuvmvGY" target="_blank">Campaign results – Open rates of 3 most recent campaigns (D2)</a>. User can click on a circle and go to analytics intelligence page for that campaign </li>
                <li><a href="https://share.getcloudapp.com/NQuvmvGY" target="_blank">Activity summary (D3)</a> and <a href="https://share.getcloudapp.com/NQuvmvGY" target="_blank">Recent Contacts and Accounts (D4)</a>Summary of email, phone and call activity. Users can change dates. Each item is clickable.</li>
                <li><a href="https://share.getcloudapp.com/Jru7YX8o" target="_blank">Open rates of campaigns</a> - This section shows a plot of open rates  of different categories of campaigns.</li>
                <li><a href="https://share.getcloudapp.com/04ugDrL4" target="_blank">Action Items</a> - Shows upcoming and recent actions items (tasks + activities). Changes to these can be made from the relevant organization’s page..</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12"><h2>Organization Tab</h2></div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <ol>
                <li>How to add an organization. See <a href="https://share.getcloudapp.com/Z4uwBzKO"  target="_blank">video</a></li>
                <li>How to lookup an organization. See <a href="https://share.getcloudapp.com/OAuL1rKJ"  target="_blank">video</a></li>
                <li>How to add a contact:
                    <ol>
                        <li>Using web app. See <a href="https://share.getcloudapp.com/mXum47GE"  target="_blank">video</a></li>
                        <li>Using Outlook Add-in. See <a href="https://share.getcloudapp.com/geurQrGe"  target="_blank">video</a></li>
                    </ol>
                </li>
                <li>How to add a communication item:
                    <ol>
                        <li>Using web app. See <a href="https://share.getcloudapp.com/qGuD8zWD"  target="_blank">video</a></li>
                        <li>Using Outlook Add-in. See <a href="https://share.getcloudapp.com/X6uDLDwA"  target="_blank">video</a></li>
                    </ol>
                </li>
            </ol>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12"><h2>Email Campaign Tab</h2></div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <ol>
                <li>Email Campaign - Create and edit email campaigns.  See <a href="https://share.getcloudapp.com/geurQYLp"  target="_blank">video</a>. </li>
                <li>Analytics Intelligence - This is the key part of email campaign analysis. This shows various analytics pertaining to campaigns. See <a href="https://share.getcloudapp.com/6quLp0nW"  target="_blank">video</a>.</li>
                <li>Distribution List - Create new distribution lists or edit existing lists. Organization contacts can be assigned to one or more dist lists from contact editor in organization page.</li>
                <li>Edit Campaign Templates - Create and edit templates used for email blasts.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>



      <div class="row mt-4">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12"><h2>Geographic Search tab</h2></div>
          </div>
          <div class="row">
            <div class="col-md-12">
                    Allows users to search organizations near and address and be able to send personalized emails from click of a button. Used by sales managers to book meetings near to an address. Functionality not enabled until go-live.
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
            <div class="col-md-12">
              <div class="row">
                <div class="col-md-12"><h2>IR dashboard tab</h2></div>
              </div>
              <div class="row">
                <div class="col-md-12">
                        Tab to add monthly organization return information from the admin.
                </div>
              </div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-md-12">
                <div class="row">
                <div class="col-md-12"><h2>Artificial Intelligence tab</h2></div>
                </div>
                <div class="row">
                <div class="col-md-12">
                        This tab uses AI to show spikes in organization behavior (organizations opening emails and clicking URLs a lot more than before and vice versa). Functionality not enabled until go-live                    </div>
                </div>
            </div>
        </div>

        <div>
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12"><h1></h1></div>
          </div>
        </div>
      </div>


      <div>
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12"><h1>Reporting App</h1></div>
          </div>
          <div class="row">
            <div class="col-md-12">
              Following are the main canned reports. Users can configure reports as shown in this <a href="https://share.getcloudapp.com/eDu9p9Gn" target="_blank">video.</a>
            </div>
            <ol>
                <li>Organizations</li>
                <li>Postal Addresses</li>
                <li>Communication History</li>
                <li>Dist list memberships</li>
              </ol>

          </div>
        </div>
      </div>



    </module-documentation>
  `
})
export class CiDocComponent {}
