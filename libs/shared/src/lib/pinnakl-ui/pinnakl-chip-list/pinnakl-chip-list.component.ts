import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators
} from '@angular/forms';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'pinnakl-chip-list',
  templateUrl: './pinnakl-chip-list.component.html',
  styleUrls: ['./pinnakl-chip-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PinnaklChipListComponent),
      multi: true
    }
  ]
})
export class PinnaklChipListComponent implements OnInit, ControlValueAccessor {
  form: FormGroup;
  onChange: Function;
  value: any[];
  @Input() fieldName: string;
  @Output() addNewListItem = new EventEmitter<any>();
  constructor(private readonly formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      listItem: [, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form && this.form.valid) {
      this.addNewListItem.emit(this.form.value.listItem);
      this.form.reset();
    }
  }

  registerOnChange(fn): void {
    this.onChange = fn;
  }

  writeValue(value: any): void {
    this.value = cloneDeep(value);
  }

  registerOnTouched(fn): void {}

  deleteItem(index: number): void {
    this.value.splice(index, 1);
    this.onChange(this.value);
  }
}
