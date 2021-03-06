import {
    AfterViewChecked,
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnInit,
    Optional,
    Output,
    QueryList,
    SimpleChanges,
    ViewChildren
  } from '@angular/core';
  import {
    defaultComponentConfig
  } from './2fa-code-input.component.config';
  
  enum InputState {
    ready = 0,
    reset = 1
  }
  
  @Component({
    // tslint:disable-next-line:component-selector
    selector: 'pnkl-code-input',
    templateUrl: '2fa-code-input.component.html',
    styleUrls: ['./2fa-code-input.component.scss']
  })
export class CodeInputComponent implements AfterViewInit, OnInit, OnChanges, AfterViewChecked {
  
    @ViewChildren('input') inputsList !: QueryList<ElementRef>;
  
    @Input() codeLength !: number;
    @Input() inputType !: string;
    @Input() initialFocusField?: number;
    /** @deprecated Use isCharsCode prop instead. */
    @Input() isNonDigitsCode = false;
    @Input() isCharsCode !: boolean;
    @Input() isCodeHidden !: boolean;
    @Input() isPrevFocusableAfterClearing !: boolean;
    @Input() isFocusingOnLastByClickIfFilled !: boolean;
    @Input() code ?: string | number;
    @Input() disabled !: boolean;
  
    @Output() readonly codeChanged = new EventEmitter<string>();
    @Output() readonly codeCompleted = new EventEmitter<string>();
  
    public placeholders !: number[];
  
    private inputs: HTMLInputElement[] = [];
    private inputsStates: InputState[] = [];
  
    // tslint:disable-next-line:variable-name
    private _codeLength !: number;
    private state = {
      isFocusingAfterAppearingCompleted: false,
      isInitialFocusFieldEnabled: false
    };
  
    constructor() {
      Object.assign(this, defaultComponentConfig);
    }
  
    /**
     * Life cycle
     */
  
    ngOnInit(): void {
      // defining internal code length prop for skipping external prop updates
      this._codeLength = this.codeLength;
      this.placeholders = Array(this._codeLength).fill(1);
      this.state.isInitialFocusFieldEnabled = !this.isEmpty(this.initialFocusField);
    }
  
    ngAfterViewInit(): void {
      this.inputsList.forEach((item) => {
        this.inputs.push(item.nativeElement);
        this.inputsStates.push(InputState.ready);
      });
  
      // the @Input code might have value. Checking
      this.onInputCodeChanges();
    }
  
    ngAfterViewChecked(): void {
      this.focusOnInputAfterAppearing();
    }
  
    ngOnChanges(changes: SimpleChanges): void {
      if (changes.code) {
        this.onInputCodeChanges();
      }
    }
  
    /**
     * Methods
     */
  
    reset(isChangesEmitting?: boolean): void {
      // resetting the code to its initial value or to an empty value
      this.onInputCodeChanges();
  
      if (this.state.isInitialFocusFieldEnabled) {
        // tslint:disable-next-line:no-non-null-assertion
        this.focusOnField(this.initialFocusField!);
      }
  
      if (isChangesEmitting) {
        this.emitChanges();
      }
    }
  
    focusOnField(index: number): void {
      if (index >= this._codeLength) {
        throw new Error('The index of the focusing input box should be less than the codeLength.');
      }
  
      this.inputs[index].focus();
    }
  
    onClick(e: any): void {
      // handle click events only if the the prop is enabled
      if (!this.isFocusingOnLastByClickIfFilled) {
        return;
      }
  
      const target = e.target;
      const last = this.inputs[this._codeLength - 1];
      // already focused
      if (target === last) {
        return;
      }
  
      // check filling
      const isFilled = this.getCurrentFilledCode().length >= this._codeLength;
      if (!isFilled) {
        return;
      }
  
      // focusing on the last input if is filled
      setTimeout(() => last.focus());
    }
  
    onInput(e: any, i: number): void {
      const target = e.target;
      const value = e.data || target.value;
  
      if (this.isEmpty(value)) {
        return;
      }
  
      // only digits are allowed if isCharsCode flag is absent/false
      if (!this.canInputValue(value)) {
        e.preventDefault();
        e.stopPropagation();
        this.setInputValue(target, null);
        this.setStateForInput(target, InputState.reset);
        return;
      }
  
      const values = value.toString().trim().split('');
      for (let j = 0; j < values.length; j++) {
        const index = j + i;
        if (index > this._codeLength - 1) {
          break;
        }
  
        this.setInputValue(this.inputs[index], values[j]);
      }
      this.emitChanges();
  
      const next = i + values.length;
      if (next > this._codeLength - 1) {
        target.blur();
        return;
      }
  
      this.inputs[next].focus();
    }
  
    onPaste(e: ClipboardEvent, i: number): void {
      e.preventDefault();
      e.stopPropagation();
  
      const data = e.clipboardData ? e.clipboardData.getData('text').trim() : undefined;
  
      if (this.isEmpty(data)) {
        return;
      }
  
      // Convert paste text into iterable
      // tslint:disable-next-line:no-non-null-assertion
      const values = data!.split('');
      let valIndex = 0;
  
      for (let j = i; j < this.inputs.length; j++) {
        // The values end is reached. Loop exit
        if (valIndex === values.length) {
          break;
        }
  
        const input = this.inputs[j];
        const val = values[valIndex];
  
        // Cancel the loop when a value cannot be used
        if (!this.canInputValue(val)) {
          this.setInputValue(input, null);
          this.setStateForInput(input, InputState.reset);
          return;
        }
  
        this.setInputValue(input, val.toString());
        valIndex++;
      }
  
      this.inputs[i].blur();
      this.emitChanges();
    }
  
    async onKeydown(e: any, i: number): Promise<void> {
      const target = e.target;
      const isTargetEmpty = this.isEmpty(target.value);
      const prev = i - 1;
  
      // processing only backspace events
      const isBackspaceKey = await this.isBackspaceKey(e);
      if (!isBackspaceKey) {
        return;
      }
  
      e.preventDefault();
  
      this.setInputValue(target, null);
      if (!isTargetEmpty) {
        this.emitChanges();
      }
  
      if (prev < 0) {
        return;
      }
  
      if (isTargetEmpty || this.isPrevFocusableAfterClearing) {
        this.inputs[prev].focus();
      }
    }
  
    private onInputCodeChanges(): void {
      if (!this.inputs.length) {
        return;
      }
  
      if (this.isEmpty(this.code)) {
        this.inputs.forEach((input: HTMLInputElement) => {
          this.setInputValue(input, null);
        });
        return;
      }
  
      // tslint:disable-next-line:no-non-null-assertion
      const chars = this.code!.toString().trim().split('');
      // checking if all the values are correct
      let isAllCharsAreAllowed = true;
      for (const char of chars) {
        if (!this.canInputValue(char)) {
          isAllCharsAreAllowed = false;
          break;
        }
      }
  
      this.inputs.forEach((input: HTMLInputElement, index: number) => {
        const value = isAllCharsAreAllowed ? chars[index] : null;
        this.setInputValue(input, value);
      });
    }
  
    private focusOnInputAfterAppearing(): void {
      if (!this.state.isInitialFocusFieldEnabled) {
        return;
      }
  
      if (this.state.isFocusingAfterAppearingCompleted) {
        return;
      }
  
      // tslint:disable-next-line:no-non-null-assertion
      this.focusOnField(this.initialFocusField!);
      // tslint:disable-next-line:no-non-null-assertion
      this.state.isFocusingAfterAppearingCompleted = document.activeElement === this.inputs[this.initialFocusField!];
    }
  
    private emitChanges(): void {
      setTimeout(() => this.emitCode(), 50);
    }
  
    private emitCode(): void {
      const code = this.getCurrentFilledCode();
  
      this.codeChanged.emit(code);
  
      if (code.length >= this._codeLength) {
        this.codeCompleted.emit(code);
      }
    }
  
    private getCurrentFilledCode(): string {
      let code = '';
  
      for (const input of this.inputs) {
        if (!this.isEmpty(input.value)) {
          code += input.value;
        }
      }
  
      return code;
    }
  
    private isBackspaceKey(e: any): Promise<boolean> {
      const isBackspace = (e.key && e.key.toLowerCase() === 'backspace') || (e.keyCode && e.keyCode === 8);
      if (isBackspace) {
        return Promise.resolve(true);
      }
  
      // process only key with placeholder keycode on android devices
      if (!e.keyCode || e.keyCode !== 229) {
        return Promise.resolve(false);
      }
  
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          const input = e.target;
          const isReset = this.getStateForInput(input) === InputState.reset;
          if (isReset) {
            this.setStateForInput(input, InputState.ready);
          }
          // if backspace key pressed the caret will have position 0 (for single value field)
          resolve(input.selectionStart === 0 && !isReset);
        });
      });
    }
  
    private setInputValue(input: HTMLInputElement, value: any): void {
      const isEmpty = this.isEmpty(value);
      const valueClassCSS = 'has-value';
      const emptyClassCSS = 'empty';
      if (isEmpty) {
        input.value = '';
        input.classList.remove(valueClassCSS);
        // tslint:disable-next-line:no-non-null-assertion
        input.parentElement!.classList.add(emptyClassCSS);
      } else {
        input.value = value;
        input.classList.add(valueClassCSS);
        // tslint:disable-next-line:no-non-null-assertion
        input.parentElement!.classList.remove(emptyClassCSS);
      }
    }
  
    private canInputValue(value: any): boolean {
      if (this.isEmpty(value)) {
        return false;
      }
  
      const isDigitsValue = /^[0-9]+$/.test(value.toString());
      return isDigitsValue || (this.isCharsCode || this.isNonDigitsCode);
    }
  
    private setStateForInput(input: HTMLInputElement, state: InputState): void {
      const index = this.inputs.indexOf(input);
      if (index < 0) {
        return;
      }
  
      this.inputsStates[index] = state;
    }
  
    private getStateForInput(input: HTMLInputElement): InputState | undefined {
      const index = this.inputs.indexOf(input);
      return this.inputsStates[index];
    }
  
    private isEmpty(value: any): boolean {
      return  value === null || value === undefined || !value.toString().length;
    }
  }
