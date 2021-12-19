import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AssetType } from '@pnkl-frontend/shared';
import { Security } from '@pnkl-frontend/shared';

@Component({
  selector: 'securities-home',
  templateUrl: 'securities-home.component.html',
  styleUrls: ['securities-home.component.scss']
})
export class SecuritiesHomeComponent implements OnDestroy, OnInit {
  addSecurityManuallyForm: FormGroup;
  assetTypes: AssetType[];
  editSecurityForm: FormGroup;
  hideEditSecurityModal = true;
  hideManualSecurityModal = true;
  hideSecurityAddModal = true;
  hideSecurityAutomaticModal = true;
  private securityChangedSubscription: Subscription;
  submitted = false;
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {
    Object.assign(this, this.activatedRoute.snapshot.data.resolvedData);
  }

  ngOnInit(): void {
    this.initializeAddSecurityManuallyForm();
    this.initializeEditSecurityForm();
  }

  ngOnDestroy(): void {
    this.securityChangedSubscription.unsubscribe();
  }

  toggleSecurityAddModal(): void {
    this.hideSecurityAddModal = !this.hideSecurityAddModal;
  }

  openManualSecurityModal(): void {
    if (!this.hideSecurityAddModal) {
      this.toggleSecurityAddModal();
    }
    this.toggleManualSecurityModal();
  }

  openSecurityAutomaticModal(): void {
    if (!this.hideSecurityAddModal) {
      this.toggleSecurityAddModal();
    }

    this.toggleSecurityAutomaticModal();
  }

  toggleEditSecurityModal(): void {
    this.hideEditSecurityModal = !this.hideEditSecurityModal;
  }

  toggleSecurityAutomaticModal(): void {
    this.hideSecurityAutomaticModal = !this.hideSecurityAutomaticModal;
  }

  toggleManualSecurityModal(): void {
    this.hideManualSecurityModal = !this.hideManualSecurityModal;
  }

  private initializeAddSecurityManuallyForm(): void {
    this.addSecurityManuallyForm = this.fb.group({
      assetType: [null, Validators.required]
    });
    this.addSecurityManuallyForm.controls['assetType'].valueChanges.subscribe(
      (assetType: AssetType) => {
        if (!assetType) {
          return;
        }
        this.hideManualSecurityModal = true;
        this.router.navigate([
          '/securities/security-details',
          assetType.id,
          assetType.assetType
        ]);
      }
    );
  }

  private initializeEditSecurityForm(): void {
    this.editSecurityForm = this.fb.group({
      security: [null, Validators.required]
    });
    this.securityChangedSubscription = this.editSecurityForm.controls[
      'security'
      ].valueChanges.subscribe((security: Security) => {
      if (!security || !security?.assetTypeId) {
        return;
      }
      this.hideEditSecurityModal = true;
      this.router.navigate([
        '/securities/security-details',
        security.assetTypeId,
        security.assetType,
        { securityId: security.id }
      ]);
    });
  }
}
