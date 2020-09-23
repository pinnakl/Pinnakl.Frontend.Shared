import { ElementRef, Injectable } from '@angular/core';

import { TooltipDirective } from '@progress/kendo-angular-tooltip';

@Injectable()
export class PnklTooltipService {
  constructor() {}
  show({
    elementRef,
    name,
    tooltipDirective
  }: {
    elementRef: ElementRef;
    name: string;
    tooltipDirective: TooltipDirective;
  }): void {
    const tooltipCount = getTooltipCount(name);
    if (tooltipCount === 2) {
      return;
    }
    setTimeout(() => {
      tooltipDirective.show(elementRef);
      setTooltipCount(name, tooltipCount + 1);
    });
  }
}

function getTooltipCount(name: string): number {
  const { tooltipCounts: tooltipCountsString } = localStorage;
  if (!tooltipCountsString) {
    return 0;
  }
  const tooltipCounts: { name: string; count: number }[] = JSON.parse(
    tooltipCountsString
  );
  const tooltipCount = tooltipCounts.find(
    tc => tc.name.toLowerCase() === name.toLowerCase()
  );
  return tooltipCount ? tooltipCount.count : 0;
}

function setTooltipCount(name: string, count: number): void {
  const { tooltipCounts: tooltipCountsString } = localStorage;
  const tooltipCounts: { name: string; count: number }[] = tooltipCountsString
    ? JSON.parse(tooltipCountsString)
    : [];
  const tooltipCount = tooltipCounts.find(
    tc => tc.name.toLowerCase() === name.toLowerCase()
  );
  if (tooltipCount) {
    tooltipCount.count = count;
  } else {
    tooltipCounts.push({ name, count });
  }
  localStorage.tooltipCounts = JSON.stringify(tooltipCounts);
}
