import { Component } from '@angular/core';

@Component({
  selector: 'cp-documentation',
  template: `
    <module-documentation #parent>
      <div class="row">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12"><h1>CRM Organizations</h1></div>
          </div>
          <div class="row">
            <div class="col-md-12">
              This screen is used to view and contact investment prospects
              around a location. Main functions of the screen are –
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <ol>
                <li>
                  Select an organization and view the investment prospects near that
                  organization’s address on a map
                </li>
                <li>
                  Send a personalized email to any of the prospects available
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12"><h2>View Prospects</h2></div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <ol>
                <li>Go to CRM Prospecting from the navigation menu</li>
                <li>
                  Login using your outlook account. This will enable you to send
                  personalized emails to prospects using your account
                </li>
                <li>Search for an organization using the search box</li>
                <li>Select an organization from the search results</li>
                <li>Select an organization address</li>
                <li>Select the criteria to filter the prospecting results</li>
                <li>
                  The prospecting results will now be visible on a map and in
                  the email panel
                </li>
              </ol>
              <button
                class="btn btn-success waves-effect"
                (click)="
                  parent.showDemo(
                    'https://portalvhdsmhsd8nkfxlwl2.blob.core.windows.net/platformhelpcontent/ViewProspectingResults.mp4'
                  )
                "
                href=""
              >
                View demo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12"><h2>Send email to prospects</h2></div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <ol>
                <li>Open prospecting results</li>
                <li>
                  Select a contact for sending email by clicking the Add icon
                  next to each contact in the email panel
                </li>
                <li>
                  Enter subject and email content and optionally, add an
                  attachment
                </li>
                <li>Click on send email</li>
                <li>
                  The email will be sent to that contact and this communication
                  will be added to the organization’s communication history
                </li>
              </ol>
              <button
                class="btn btn-success waves-effect"
                (click)="
                  parent.showDemo(
                    'https://portalvhdsmhsd8nkfxlwl2.blob.core.windows.net/platformhelpcontent/SendProspectingEmails.mp4'
                  )
                "
                href=""
              >
                View demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </module-documentation>
  `
})
export class CpDocComponent {}
