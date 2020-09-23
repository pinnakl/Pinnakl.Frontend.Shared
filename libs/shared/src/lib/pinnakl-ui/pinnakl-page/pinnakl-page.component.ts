import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'pinnakl-page',
  templateUrl: './pinnakl-page.component.html',
  styleUrls: ['./pinnakl-page.component.scss']
})
export class PinnaklPageComponent implements OnInit, OnChanges {
  @Input() pageWidthPercent = 100; // this will be less than 100 in case of slider-as-column
  @Input() sliderWidthPercent: number;
  @Input() sliderDisplay = false; // this is used to hide and show the slider
  @Input() sliderType:
    | 'slider-as-nowrap'
    | 'slider-as-column'
    | 'slider-as-absolute';
  pageColStyle: any = {};
  sliderColStyle: any = {};
  constructor() {}

  ngOnInit(): void {
    if (this.sliderDisplay) {
      this.pageColStyle = {
        'max-width': `${this.pageWidthPercent}%`,
        flex: `0 0 ${this.pageWidthPercent}%`
      };
    } else {
      this.pageColStyle = {
        'max-width': `100%`,
        flex: `0 0 100%`
      };
    }

    if (this.sliderType === 'slider-as-nowrap') {
      if (this.sliderDisplay) {
        this.sliderColStyle = {
          'max-width': `${this.sliderWidthPercent}%`,
          flex: `0 0 ${this.sliderWidthPercent}%`
        };
      } else {
        this.sliderColStyle = {
          display: 'none'
        };
      }
    }

    if (this.sliderType === 'slider-as-column') {
      this.sliderColStyle = {
        'max-width': `${this.sliderWidthPercent}%`,
        flex: `0 0 ${this.sliderWidthPercent}%`
      };
    }
    if (this.sliderType === 'slider-as-absolute') {
      if (this.sliderDisplay) {
        this.sliderColStyle = {
          'max-width': `${this.sliderWidthPercent}%`
        };
      } else {
        this.sliderColStyle = {
          'max-width': `${this.sliderWidthPercent}%`,
          width: `${this.sliderWidthPercent}%`,
          right: `-${this.sliderWidthPercent}%`
        };
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.sliderDisplay) {
      if (this.sliderType === 'slider-as-column') {
        if (changes.sliderDisplay.currentValue) {
          this.pageColStyle = {
            'max-width': `${this.pageWidthPercent}%`,
            flex: `0 0 ${this.pageWidthPercent}%`
          };
          this.sliderColStyle = {
            'max-width': `${this.sliderWidthPercent}%`,
            flex: `0 0 ${this.sliderWidthPercent}%`
          };
        } else {
          this.pageColStyle = {
            'max-width': '100%',
            flex: '0 0 100%'
          };
          this.sliderColStyle = {
            'max-width': `${this.sliderWidthPercent}%`,
            flex: `0 0 ${this.sliderWidthPercent}%`
          };
        }
      }

      if (this.sliderType === 'slider-as-absolute') {
        if (changes.sliderDisplay.currentValue) {
          this.sliderColStyle = {
            'max-width': `${this.sliderWidthPercent}%`,
            width: `${this.sliderWidthPercent}%`,
            right: 0
          };
        } else {
          this.sliderColStyle = {
            'max-width': `${this.sliderWidthPercent}%`,
            width: `${this.sliderWidthPercent}%`,
            right: `-${this.sliderWidthPercent}%`
          };
        }
      }

      if (this.sliderType === 'slider-as-nowrap') {
        if (changes.sliderDisplay.currentValue) {
          this.sliderColStyle = {
            'max-width': `${this.sliderWidthPercent}%`,
            flex: `0 0 ${this.sliderWidthPercent}%`
          };
        } else {
          this.sliderColStyle = {
            display: 'none'
          };
        }
      }
    }
  }
}
