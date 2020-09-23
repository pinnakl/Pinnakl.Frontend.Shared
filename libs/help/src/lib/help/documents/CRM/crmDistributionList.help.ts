import { Component } from '@angular/core';

@Component({
  selector: 'cdl-documentation',
  template: `
    <module-documentation #parent>
      <div class="row">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12"><h1>Distribution List</h1></div>
          </div>
          <div class="row">
            <div class="col-md-12">
              Distribution List is a place where organizations can store their
              contacts. Organizations can add, edit and send emails through their
              Distribution List. Organizations can access it by choosing
              Distribution List option when clicked on CRM in navigation menu.
              The following features are available in this screen -
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12"><h2>Current Lists</h2></div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <ol>
                <li>
                  It is used to show all the Distribution Lists available for
                  the Organization
                </li>
                <li>
                  Organizations have the option of opening Add/Edit Panel and Send
                  Email panel
                </li>
              </ol>
              <button
                class="btn btn-success waves-effect"
                (click)="
                  parent.showDemo(
                    'https://portalvhdsmhsd8nkfxlwl2.blob.core.windows.net/platformhelpcontent/current-list.mp4'
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
            <div class="col-md-12"><h2>Add/Edit Panel</h2></div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <ol>
                <li>It is used to add or edit a Distribution List</li>
              </ol>
              <button
                class="btn btn-success waves-effect"
                (click)="
                  parent.showDemo(
                    'https://portalvhdsmhsd8nkfxlwl2.blob.core.windows.net/platformhelpcontent/addEdit-panel.mp4'
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
export class CdlDocComponent {}
