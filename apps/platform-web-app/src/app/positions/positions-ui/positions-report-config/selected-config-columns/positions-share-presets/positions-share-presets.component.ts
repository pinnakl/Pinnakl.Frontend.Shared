import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PinnaklSpinner, Toastr, User } from '@pnkl-frontend/core';
import { AccessControlService, Destroyable } from '@pnkl-frontend/shared';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { PositionsSharePresetsService } from './positions-share-presets.service';

@Component({
  selector: 'positions-share-presets',
  templateUrl: './positions-share-presets.component.html',
  styleUrls: ['./positions-share-presets.component.scss']
})
export class PositionsSharePresetsComponent extends Destroyable implements OnInit {
  @Input() presets: any[];
  @Output() closeModal = new EventEmitter<void>();
  users: User[] = [];

  sharePresetsForm: FormGroup;

  constructor(
    private readonly toastr: Toastr,
    private readonly spinner: PinnaklSpinner,
    private readonly positionsSharePresetsService: PositionsSharePresetsService,
    private readonly accessControlService: AccessControlService) {
    super();
  }

  ngOnInit(): void {
    this.initSharePresetsForm();
    this.getUsersForShare();
  }

  private initSharePresetsForm(): void {
    this.sharePresetsForm = new FormGroup({
      presets: new FormControl(null, Validators.required),
      users: new FormControl(null, Validators.required)
    });
  }

  private getUsersForShare(): void {
    this.spinner.spin();
    this.accessControlService.getAccessControlUsers()
      .pipe(takeUntil(this.unsubscribe$), finalize(() => this.spinner.stop()))
      .subscribe((users: User[]) => this.users = users);
  }

  sharePresets(): void {
    this.spinner.spin();

    const presets = this.sharePresetsForm.value.presets.map((preset) => ({
        name: preset.name,
        columnsConfig: preset.columnsConfig
      }));

    // TODO connection many to many (each preset should be applied to each user);
    forkJoin(this.sharePresetsForm.value.users.map((user: User) =>
      forkJoin(presets.map(preset => this.positionsSharePresetsService.sharePreset(user.id, preset)))))
      .pipe(takeUntil(this.unsubscribe$), finalize(() => this.spinner.stop()))
      .subscribe((res) => {
        this.closeModal.emit();
        this.toastr.success('Selected presets have been shared');
      });
  }
}
