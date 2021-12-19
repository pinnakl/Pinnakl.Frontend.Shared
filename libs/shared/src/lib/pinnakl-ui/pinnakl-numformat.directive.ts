import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  OnInit,
  Renderer2
} from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PinnaklInputComponent } from './pinnakl-input/pinnakl-input.component';

@Directive({
  selector: '[pnklNumFormat]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PinnaklNumFormatDirective),
      multi: true
    }
  ]
})
export class PinnaklNumFormatDirective implements ControlValueAccessor, OnInit {
  @Input('decimals') decimals = 15;
  @Input('textalign') textalign = 'left';
	@Input('allowNegative') allowNegative = true;
  private keycodepressed: any;

  constructor(
    private readonly el: ElementRef,
    private readonly rd: Renderer2,
    private readonly pinnaklinput: PinnaklInputComponent
  ) {}

  ngOnInit() {
    this.rd.setStyle(this.el.nativeElement, 'text-align', this.textalign);
  }
  propagateChange = (_: any) => {};

  public writeValue(viewvalue: any) {
    if (isNaN(viewvalue) === true) {
      // this.rd.setAttribute(this.el.nativeElement, 'value', '')
      this.el.nativeElement.value = '';
      setTimeout(_ =>
        (this.pinnaklinput.form as FormGroup).controls[this.pinnaklinput.controlName].reset()
      );
    } else {
      if (viewvalue === null) {
        // this.rd.setAttribute(this.el.nativeElement, 'value', '');
        this.el.nativeElement.value = '';
      } else {
        viewvalue = this.toFormat(viewvalue);
        // this.rd.setAttribute(this.el.nativeElement, 'value', viewvalue);
        this.el.nativeElement.value = viewvalue;
      }
    }
  }
  public registerOnChange(fn) {
    this.propagateChange = fn;
  }
  public registerOnTouched() {}

  @HostListener('keydown', ['$event'])
  onkeydown($event) {
    this.keycodepressed = $event.keyCode;
    function doGetCaretPosition(ctrl) {
      let CaretPos = 0;
      if (ctrl.selectionStart || ctrl.selectionStart == '0') {
        CaretPos = ctrl.selectionStart;
        return CaretPos;
      }
    }
    function setCaretPosition(ctrl, pos) {
      if (ctrl.setSelectionRange) {
        ctrl.focus();
        ctrl.setSelectionRange(pos, pos);
      } else if (ctrl.createTextRange) {
        let range = ctrl.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
      }
    }
    // if the user start type with minus (both - under the F9 and on the right side)
    // and negatie values are not allowed - prevent of typing.
    if (($event.keyCode === 189 || $event.keyCode === 109) && !this.allowNegative) {
      $event.preventDefault();
      $event.stopPropagation();
      return;
    }
    if ($event.keyCode === 190 && this.decimals === 0) {
      $event.preventDefault();
      $event.stopPropagation();
      return;
    }
    let validKeys = [
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      189,
      190,
      46,
      8,
      9,
      27,
      13,
      110,
      35,
      36,
      37,
      38,
      39,
      40,
      96,
      97,
      98,
      99,
      100,
      101,
      102,
      103,
      104,
      105,
      109
    ];
    let digits = [
      96,
      97,
      98,
      99,
      100,
      101,
      102,
      103,
      104,
      105,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57
    ];
    if (validKeys.indexOf($event.keyCode) == -1) {
      $event.preventDefault();
      $event.stopPropagation();
      return;
    }
    if (
      $event.keyCode == 189 &&
      (doGetCaretPosition($event.target) != 0 || $event.target.value[0] == '-')
    ) {
      $event.preventDefault();
      $event.stopPropagation();
      return;
    } else if ($event.keyCode === 190) {
      // if it is a first input character and started from dot - assign to the input `.` value
      if (doGetCaretPosition($event.target) === 0 || $event.target.value === "") {
        this.el.nativeElement.value = ".";
        $event.preventDefault();
        $event.stopPropagation();
        return;
      }
      if (
        doGetCaretPosition($event.target) == 0 ||
        ($event.target.value[0] == '-' &&
          doGetCaretPosition($event.target) == 1)
      ) {
        $event.preventDefault();
        $event.stopPropagation();
        return;
      }

      if (!/^\d{1,3}(,\d{3})*$/.test($event.target.value)) {
        if ($event.target.value[0] != '-') {
          $event.preventDefault();
          $event.stopPropagation();
          return;
        } else if ($event.target.value.indexOf('.') != -1) {
          $event.preventDefault();
          $event.stopPropagation();
          return;
        }
      }
    }
    if (
      digits.indexOf($event.keyCode) !== -1 &&
      doGetCaretPosition($event.target) == 0 &&
      $event.target.value[0] == '-'
    ) {
      $event.preventDefault();
      $event.stopPropagation();
      return;
    }
    if (
      digits.indexOf($event.keyCode) !== -1 &&
      doGetCaretPosition($event.target) > $event.target.value.indexOf('.') &&
      $event.target.value.indexOf('.') !== -1
    ) {
      if ($event.target.value.split('.')[1].length == this.decimals) {
        $event.preventDefault();
        $event.stopPropagation();
        return;
      }
    }
  }

  @HostListener('input', ['$event'])
  oninput($event) {
    let startPos = $event.target.selectionStart;
    let initialNumberOfCommas = this.getNumberOfCommas($event.target.value);
    $event.target.value = this.formatNumber(
      this.getNumber($event.target.value)
    );
    let finalNumberOfCommas = this.getNumberOfCommas($event.target.value);
    if (finalNumberOfCommas > initialNumberOfCommas) {
      if (this.keycodepressed !== 8 && this.keycodepressed !== 46) {
        startPos += 1;
      }
    } else if (finalNumberOfCommas < initialNumberOfCommas) {
      startPos -= 1;
    }
    $event.target.selectionEnd = startPos;
    let modelvalue = parseFloat(this.fromFormat($event.target.value));
    if (isNaN(modelvalue) == true) {
      modelvalue = null;
    }
    this.propagateChange(modelvalue);
  }
  private getNumberOfCommas(val) {
    return val.split(',').length - 1;
  }
  private getNumber(val) {
    return val.replace(/,/gi, '');
  }
  private formatInteger(strval) {
    let intVal = parseInt(strval);
    let formattedResult = '';
    if (strval == '-' || strval === '-0') {
      return strval;
    }

    if (isNaN(intVal) === false) {
      let absVal = Math.abs(intVal);
      strval = String(absVal);
      let sign = intVal < 0 ? '-' : '';

      for (let i = 0; i < strval.length; i++) {
        if (i % 3 == strval.length % 3 && i !== 0) {
          formattedResult += ',';
        }
        formattedResult += strval[i];
      }
      formattedResult = sign + formattedResult;
      formattedResult = formattedResult.replace(/^,/gi, '');
    }
    return formattedResult;
  }

  private formatNumber(val) {
    let valarr = val.split('.');
    let fi = this.formatInteger(valarr[0]);

    if (this.decimals > 0 && valarr.length > 1) {
      let decv = valarr[1].substr(
        0,
        Math.min(this.decimals || valarr[1].length)
      );
      return fi + '.' + decv;
    } else {
      return fi;
    }
  }

  private toFormat(text) {
    if (text || text === 0) {
      let formatted = this.formatNumber(text.toString());
      return formatted;
    } else {
      return '';
    }
  }

  private fromFormat(text) {
    if (text) {
      return this.getNumber(text);
    } else {
      return '';
    }
  }

  @HostListener('blur', ['$event'])
  onblur($event) {
    let modelvalue = Math.abs($event.target.value);
    if (modelvalue === 0) {
      $event.target.value = modelvalue;
      this.propagateChange(modelvalue);
    }
  }
}
