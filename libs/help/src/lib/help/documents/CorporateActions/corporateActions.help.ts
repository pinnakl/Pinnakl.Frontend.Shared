import { Component } from '@angular/core';

@Component({
  selector: 'ca-documentation',
  template: `
    <module-documentation #parent>
      <div class="row">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12"><h1>Corporate Actions</h1></div>
          </div>
          <div class="row">
            <div class="col-md-12">
              This screen is used to view and manage Corporate Action Event for
              your portfolio in the Pinnakl system. Main functions of the screen
              are –
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <ol>
                <li>View Corporate Action Events</li>
                <li>Add Corporate Action Event</li>
                <li>Edit an Existing event</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12"><h2>View Corporate Actions</h2></div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <ol>
                <li>Go to Corporate Actions from the navigation menu</li>
                <li>
                  On Corporate Actions screen , events are shown in a calendar
                  based event grid with start date being 1st January and end
                  date being 31st December of current year
                </li>
                <li>Clicking on event icons shows event details popup</li>
                <li>
                  User can further filter events by clicking on filter icon on
                  right hand corner of screen. Currently events can be filtered
                  on
                  <ul>
                    <li>date</li>
                    <li>event-type</li>
                    <li>security</li>
                  </ul>
                </li>
              </ol>
              <button
                class="btn btn-success waves-effect"
                (click)="
                  parent.showDemo(
                    'https://portalvhdsmhsd8nkfxlwl2.blob.core.windows.net/platformhelpcontent/ViewCorporateActionEvents.mp4'
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
            <div class="col-md-12"><h2>Add Corporate Action</h2></div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <ol>
                <li>Go to Corporate Actions from the navigation menu</li>
                <li>
                  Header columns shows the types of events which can be added
                  from the screen
                </li>
                <li>Click on any event</li>
                <li>
                  Enter the required details in input fields in side panel
                </li>
                <li>Click Save</li>
              </ol>
              <button
                class="btn btn-success waves-effect"
                (click)="
                  parent.showDemo(
                    'https://portalvhdsmhsd8nkfxlwl2.blob.core.windows.net/platformhelpcontent/AddCorporateActionEvent.mp4'
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
            <div class="col-md-12"><h2>Edit Corporate Action</h2></div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <ol>
                <li>Go to Corporate Actions from the navigation menu</li>
                <li>Click on any one of the events shown in calendar</li>
                <li>Click on the edit icon</li>
                <li>Edit or add new information using the input fields</li>
                <li>Click Save</li>
              </ol>
              <button
                class="btn btn-success waves-effect"
                (click)="
                  parent.showDemo(
                    'https://portalvhdsmhsd8nkfxlwl2.blob.core.windows.net/platformhelpcontent/UpdateCorporateActionEvent.mp4'
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
            <div class="col-md-12"><h2>Delete Corporate Action</h2></div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <ol>
                <li>Go to Corporate Actions from the navigation menu</li>
                <li>Click on any one of the events shown in calendar</li>
                <li>Click the delete icon</li>
              </ol>
              <button
                class="btn btn-success waves-effect"
                (click)="
                  parent.showDemo(
                    'https://portalvhdsmhsd8nkfxlwl2.blob.core.windows.net/platformhelpcontent/DeleteCorporateActionEvent.mp4'
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
export class CaDocComponent {}
