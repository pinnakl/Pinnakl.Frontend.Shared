import {
  Component,
  ElementRef,
  forwardRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface Editor {
  execCommand: (command: string, uiState: boolean, argument: string) => void;
  getContent: () => string;
  on: (event: string, eventHandler: () => void) => void;
}

declare let tinymce: {
  init: (config: {}) => void;
  remove: (editor: Editor) => void;
};

@Component({
  selector: 'rich-text-area',
  template: `
    <textarea #textarea></textarea>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextAreaComponent),
      multi: true
    }
  ]
})
export class RichTextAreaComponent
  implements ControlValueAccessor, OnDestroy, OnInit {
  editor: Editor;
  @ViewChild('textarea', { static: true }) private elementRef: ElementRef;

  constructor(private readonly ngZone: NgZone) {}

  ngOnDestroy(): void {
    tinymce.remove(this.editor);
  }

  ngOnInit(): void {
    tinymce.init({
      height: 500,
      target: this.elementRef.nativeElement,
      plugins: ['image lists link paste textcolor'],
      menubar: false,
      skin_url: '../../assets/skins/lightgray',
      // tslint:disable-next-line:max-line-length
      toolbar:
        'insert | undo redo | formatselect | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
      setup: (editor: Editor) => {
        this.editor = editor;
        editor.on('change', this.propagateEditorContent.bind(this));
        editor.on('keyup', this.propagateEditorContent.bind(this));
      }
    });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  setDisabledState(isDisabled: boolean): void {}

  writeValue(value: string): void {
    if (!this.editor) {
      return;
    }
    if (!value) {
      value = '';
    }
    this.editor.execCommand('mceSetContent', true, value);
  }

  private propagateChange(content: string): void {}

  private propagateEditorContent(): void {
    this.ngZone.run(() => {
      const content = this.editor.getContent();
      this.propagateChange(content);
    });
  }
}
