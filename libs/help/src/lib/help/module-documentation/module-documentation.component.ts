import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'module-documentation',
  templateUrl: './module-documentation.component.html',
  styleUrls: ['./module-documentation.component.scss']
})
export class ModuleDocumentationComponent implements OnInit {
  currentDocument: string;
  showvideo = false;
  htmlSource: any;
  safevideourl: any;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {}

  showDemo(sourceUrl) {
    this.safevideourl = this.trustUrl(sourceUrl);
    this.showvideo = true;
  }

  stopvideo() {
    this.showvideo = false;
  }

  trustUrl(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
