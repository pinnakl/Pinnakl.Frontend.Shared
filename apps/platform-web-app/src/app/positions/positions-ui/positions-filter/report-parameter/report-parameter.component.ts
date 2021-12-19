import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Subscription } from 'rxjs';

import { ReportParameter } from '@pnkl-frontend/shared';

@Component({
  selector: 'report-parameter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './report-parameter.component.html'
})
export class ReportParameterComponent implements OnInit {
  @Input() parameters: ReportParameter[];

  @Output() onParameterUpdate = new EventEmitter<ReportParameter[]>();

  parameterForm: FormGroup;
  valueChangeSubscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.setForm();
  }

  private emitParameterChanges(
    param: ReportParameter,
    value: Date | number | string
  ): void {
    this.onParameterUpdate.emit([{ ...param, value }]);
  }

  private setForm(): void {
    const group: { [key: string]: FormControl } = {};
    this.parameters.forEach(param => {
      group[param.name] = new FormControl(param.value);
      return group[param.name].valueChanges.subscribe(
        this.emitParameterChanges.bind(this, param)
      );
    });
    this.parameterForm = new FormGroup(group);
  }
}
