import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ERROR_CORRECTION_LEVEL_MAP } from './qr-code.config';

@Component({
  selector: 'qr-code-view',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrCodeComponent {
  private _errorCorrectionLevel: string;

  @Input() qrdata: string;
  @Input() size = 300;
  @Input() set errorCorrectionLevel(lvl: string) {
    this._errorCorrectionLevel = lvl;
  }
  get errorCorrectionLevel() {
    return ERROR_CORRECTION_LEVEL_MAP[this._errorCorrectionLevel] || "M";
  }

}
