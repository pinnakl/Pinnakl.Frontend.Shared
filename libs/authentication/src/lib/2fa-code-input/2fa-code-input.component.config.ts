export interface CodeInputComponentConfig {
  codeLength?: number;
  inputType?: string;
  initialFocusField?: number;
  isCharsCode?: boolean;
  isCodeHidden?: boolean;
  isPrevFocusableAfterClearing?: boolean;
  isFocusingOnLastByClickIfFilled?: boolean;
  code?: string | number;
  disabled?: boolean;
}

export const defaultComponentConfig: CodeInputComponentConfig = {
  codeLength: 6,
  inputType: 'tel',
  initialFocusField: undefined,
  isCharsCode: false,
  isCodeHidden: false,
  isPrevFocusableAfterClearing: true,
  isFocusingOnLastByClickIfFilled: false,
  code: undefined,
  disabled: false
};
