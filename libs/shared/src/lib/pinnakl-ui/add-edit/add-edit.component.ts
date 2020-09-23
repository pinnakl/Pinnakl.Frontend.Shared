import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare let $: any;

@Component({
  selector: 'add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class AddEditComponent implements OnInit {
  @Input() name: string;
  @Input() dataList: any[];
  // @Input() dataSelected: any;
  hideEditModal = true;
  @Output() onAddNew = new EventEmitter<any>();
  @Output() onEdit = new EventEmitter<any>();
  submitted = false;
  form: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      selectedBrokerId: [, Validators.required],
      selectedFolderId: [, Validators.required]
    });
  }

  toggleModal(): void {
    this.hideEditModal = !this.hideEditModal;
  }

  onFormSubmit(): void {
    this.submitted = true;
    if (this.name === 'Broker' && this.form.value.selectedBrokerId) {
      this.onEdit.emit(this.form.value.selectedBrokerId);
    } else if (this.name === 'Folder' && this.form.value.selectedFolderId) {
      this.onEdit.emit(this.form.value.selectedFolderId);
    }
  }
}
