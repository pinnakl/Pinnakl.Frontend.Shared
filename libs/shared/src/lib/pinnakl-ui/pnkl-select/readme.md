Pinnakl Select Component

Usage -

1.  With Validation

    <form [formGroup]="form">
        <pnkl-select formControlName="counter"
            [options]="options"
            [label]="'Counter'"
            [viewProperty]="'description'"></pnkl-select>
        <pnkl-validation [form]="form"
            [controlName]="'counter'"></pnkl-validation>
    </form>
    this.form = this.fb.group({
        counter: [this.options[0], Validators.required]
    });
    this.form.patchValue({
        counter: this.options[0]
    });

2.  Without Validation
    <pnkl-select [options]="options"
    [viewProperty]="'description'"
    [label]="'COUNTER'"
    [(ngModel)]="selectedOption">
    </pnkl-select>
    this.selectedOption = this.options[0].id;

Type of collections -

1.  Primitive - E.g. ['one', 'two', 'three']
    <pnkl-select [options]="options"
    [label]="'Counter'"
    [required]="true"
    [(ngModel)]="selectedOption">
    </pnkl-select>

2.  Object - E.g. [{ id: 1, description: 'one' }, { id: 2, description: 'two' }] - Add [viewProperty] input
    <pnkl-select [options]="options"
    [label]="'Counter'"
    [viewProperty]="'description'"
    [(ngModel)]="selectedOption">
    </pnkl-select>

3.  Object with property of the object as output - Add [modelProperty] input
    <pnkl-select [options]="options"
    [viewProperty]="'description'"
    [modelProperty]="'id'"
    [label]="'Counter'"
    [(ngModel)]="selectedOption">
    </pnkl-select>

Custom values -

1.  Use [allowCustom]="true"
    <pnkl-select [options]="[1,2,3]"
    [label]="'SECURITY'"
    [required]="true"
    [allowCustom]="true"
    formControlName="pinnaklSecurityId"></pnkl-select>

2.  For a value other than the entered text, use [modelNormalizer]
    <pnkl-select [options]="securities"
    [viewProperty]="'description'"
    [modelProperty]="'id'"
    [label]="'SECURITY'"
    [required]="true"
    [allowCustom]="true"
    [modelNormalizer]="modelNormalizer"
    formControlName="pinnaklSecurityId"></pnkl-select>

modelNormalizer(textObservable: Observable<string>) {
return textObservable.map((text: string) => text.length);
}

3.  For object models, modelNormalizer is necessary.
