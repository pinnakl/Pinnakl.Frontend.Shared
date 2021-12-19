// Angular
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Models / Services
import { PositionService, Security } from '@pnkl-frontend/shared';
// Third party libs
import * as moment from 'moment';
import { PositionsBackendStateFacade } from '../../../positions-backend-state/positions-backend-state-facade.service';

@Component({
  selector: 'new-alert',
  templateUrl: './new-alert.component.html',
  styleUrls: ['./new-alert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewAlertComponent implements OnInit, OnChanges {
  @Input() securities: Security[];
  @Input() watchlistMode: boolean;
  @Input() title: string;
  @Output() hideModal = new EventEmitter<any>();
  alertForm: FormGroup;
  priceTypes = [{ value: 'Last' }, { value: 'Implied Vol' }];
  conditionTypes = [
    { value: '<=', key: 'Less or equal' },
    { value: '>=', key: 'More or equal' }
  ];
  statusTypes = [{ value: 'Active' }, { value: 'Triggered' }];
  filteredSecList: Security[];
  submitting = false;

  constructor(
    private readonly positionService: PositionService,
    private readonly positionsBackendStateFacade: PositionsBackendStateFacade,
    private readonly fb: FormBuilder
  ) {
    this.filteredSecList = this.securities;
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.title.currentValue !== this.title) {
      this.title = changes.title.currentValue;
    }
  }

  initForm(): void {
    this.alertForm = this.fb.group({
      security: [undefined, Validators.required],
      priceType: [this.priceTypes[0].value, Validators.required],
      condition: [this.conditionTypes[0].value, Validators.required],
      status: [this.statusTypes[0].value],
      price: [0, Validators.required]
    });
  }

  closeModal(): void {
    this.initForm();
    this.alertForm.reset(this.alertForm.value);
    this.hideModal.emit();
  }

  async submitForm(ev: Event): Promise<void> {
    try {
      this.submitting = true;
      ev.preventDefault();
      const {
        security: { id: securityId },
        priceType,
        condition,
        status,
        price
      } = this.alertForm.value;
      if (this.watchlistMode) {
        await this.positionService.addToWatchlist({
          securityId: securityId.toString(),
          createDateTime: moment.utc().toDate()
        });
        this.positionsBackendStateFacade.loadWatchListItems();
      } else {
        await this.positionService.creatNewAlert({
          securityId: securityId.toString(),
          priceType,
          condition,
          status,
          price: price.toString(),
          createDateTime: moment.utc().toDate()
        });
        this.positionsBackendStateFacade.loadSecurityPriceAlerts();
      }
      this.initForm();
      this.alertForm.reset(this.alertForm.value);
    } catch (e) {
      console.error(e);
    } finally {
      this.submitting = false;
      this.closeModal();
    }
  }
}
