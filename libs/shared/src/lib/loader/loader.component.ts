import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'loader-spinner',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default
})
export class LoaderComponent {

  private readonly AVAILABLE_COLORS = [
    'primary', 'secondary', 'tertiary', 'info', 'success', 'error', 'dark', 'light', 'inverse'
  ];

  private readonly AVAILABLE_TYPES = ['pulsing', 'infinite-spinner', 'converging-spinner'];

  private _color: string;
  private _type: string;

  /**
   * @param v color for loader
   * @example primary
   * @example secondary
   * @example tertiary
   * @example info
   * @example success
   * @example error
   * @example dark
   * @example light
   * @example inverse
   */
  @Input() set color(v: string) {
    this._color = v;
  }
  get color() {
    return this.AVAILABLE_COLORS.includes(this._color) ? this._color : this.AVAILABLE_COLORS[0];
  }

  /**
   * @param v type of loader
   * @example pulsing
   * @example infinite-spinner
   * @example converging-spinner
   */
  @Input() set type(v: string) {
    this._type = v;
  }
  get type() {
    return this.AVAILABLE_TYPES.includes(this._type) ? this._type : this.AVAILABLE_TYPES[0];
  }
}
