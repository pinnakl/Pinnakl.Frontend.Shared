import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

import { TooltipDirective } from '@progress/kendo-angular-tooltip';

import { PnklTooltipService } from '../pnkl-tooltip.service';

type TooltipPositions = 'top' | 'right' | 'bottom' | 'left';

@Component({
  selector: 'pnkl-tooltip',
  templateUrl: './pnkl-tooltip.component.html',
  styleUrls: ['./pnkl-tooltip.component.scss']
})
export class PnklTooltipComponent implements OnInit {
  @Input() position: TooltipPositions = 'left';
  @Input() name = '';
  @Input() text = '';

  @ViewChild(TooltipDirective, { static: true })
  tooltipDirective: TooltipDirective;
  @ViewChild('tooltipTarget', { static: true })
  tooltipTarget: ElementRef;

  constructor(private pnklTooltipService: PnklTooltipService) {}

  ngOnInit(): void {
    this.pnklTooltipService.show({
      elementRef: this.tooltipTarget,
      name: this.name,
      tooltipDirective: this.tooltipDirective
    });
  }
}
