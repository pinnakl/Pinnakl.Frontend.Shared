Pinnakl Input Component

To be used with reactive forms.
Parameters for all types -

1.  controlName(string) - The reactive FormControl name
2.  form(FormGroup) - The reactive FormGroup
3.  label(string) - Label to be displayed above the input
4.  required(boolean) - Decides whether to display the required '\*' indicator.
    Actual validation needs to be configured in the FormGroup
5.  type(string) - The type of input

Parameters for dropdown -

1.  dropdownSource(any[]) - the collection bound to the dropdown
2.  dropdownFetchData(Function) - When collection is to be fetched asynchronously, this function sets the dropdownSource

3.  dropdownOptions(object) -
    a) allowCustom(boolean) - Decides whether custom values will be allowed
    b) isAsync(boolean) - Decides whether data for the collection will be fetched asynchronously
    c) modelNormalizer(Function with input and output as observable) - For custom values, this function normalizes the text entered in the dropdown
    d) objectModel(boolean) - To be set if the input model is an object and not a primitive
    d) modelProperty(string) - Property of the collection to be used as input model. In case of object model, pass this only if the unique
    identifier for items in your collection is a property other than 'id'.
    e) viewProperty(string) - Property of the collection to be used for input view

Parameters for Numeric -

1.  decimals = Accepts digits as value to limit the fiels decimal places. Default value set to 15.
2.  textalign = Accepts a value to either 'right' or 'left' align the numeric value within the input box.

Parameters for Checkbox -

1.  checkBoxStyle = Takes in either 'default' or 'toggle' as value and produces a checkbox or a switch respectively, in response to the provided value. Default set to 'default'.

Examples -

<form [formGroup]="form"
    (ngSubmit)="onSubmit(form)"
    [class.ng-submitted]="submitted">
    <pinnakl-input controlName="dateOfBirth"
        [form]="form"
        label="DATE OF BIRTH"
        [required]="true"
        type="date">
    </pinnakl-input>
    <pinnakl-input controlName="securityId"
        [dropdownSource]="securities"
        [dropdownOptions]="{
            modelProperty: 'id',
            viewProperty: 'description'
        }"
        [form]="form"
        label="SECURITY"
        [required]="true"
        type="dropdown">
    </pinnakl-input>
    <pinnakl-input controlName="price"
        [form]="form"
        label="PRICE"
        [required]="true"
        type="numeric">
    </pinnakl-input>
    <pinnakl-input controlName="fullName"
        [form]="form"
        label="FULL NAME"
        [required]="true"
        type="text">
    </pinnakl-input>
    <pinnakl-input controlName="validated"
        [form]="form"
        [label]="VALIDATED"
        type="boolean"
        [checkBoxStyle]="'toggle'">
    </pinnakl-input>
</form>

this.form = this.fb.group({
fullName: [, Validators.required],
securityId: [this.securities[0].id, [Validators.required, this.validateSecurityId]],
dateOfBirth: [, Validators.required],
price: [, Validators.required]
});

Dropdown Async -
Add (dropdownFetchData) and [dropdownOptions.isAsync]

<pinnakl-input controlName="accountId"
[dropdownSource]="accounts"
(dropdownFetchData)="getAccounts()"
[dropdownOptions]="{
isAsync: true,
modelProperty: 'id',
viewProperty: 'accountcode'
}"
[form]="form"
label="ACCOUNT"
[required]="true"
type="dropdown">
</pinnakl-input>

getAccounts() {

        let fields = ['AccountCode','AccountNum','Name','IsPrimaryForReturns','OrderOfImportance'];
    const getWebRequest: GetWebRequest = {
      endPoint: 'accounts',
      options: {
        fields: fields
      }
    };
    return this.wsp.get(getWebRequest)

.then(accounts => this.accounts = accounts) //Set the variable which was bound to [dropdownSource]
.catch(() => this.accounts = []); //Set the variable for both success and failure
}

Dropdown Object Model -
Add [dropdownOptions.objectModel]

<pinnakl-input controlName="security"
[dropdownSource]="securities"
[dropdownOptions]="{
objectModel: true,
viewProperty: 'description'
}"
[form]="editSecurityForm"
label="SECURITY"
[required]="true"
type="dropdown">
</pinnakl-input>

Add [dropdownOptions.modelProperty] if uniqueIdentifier for the collection is not 'id'

<pinnakl-input controlName="security"
[dropdownSource]="securities"
[dropdownOptions]="{
modelProperty: 'description'
objectModel: true,
viewProperty: 'description'
}"
[form]="editSecurityForm"
label="SECURITY"
[required]="true"
type="dropdown">
</pinnakl-input>
