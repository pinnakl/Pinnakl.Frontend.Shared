import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { PinnaklModalModule } from '@pnkl-frontend/pinnakl-modal';
import { PnklChartsModule } from '@pnkl-frontend/pnkl-charts';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { ChartModule } from '@progress/kendo-angular-charts';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import {
  ComboBoxModule,
  MultiSelectModule
} from '@progress/kendo-angular-dropdowns';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { EditorModule } from '@tinymce/tinymce-angular';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { CropTextPipe } from './crop-text.pipe';
import { FILE_SERVICE_URL, HTTP_SERVICE_URL } from './enviroment.tokens';
import { HighlightSearchPipe } from './highlight-search.pipe';
import { IterateOverObjectPipe } from './iterate-over-object.pipe';
import { KeysPipe } from './keys.pipe';
import { LimitDecimalPipe } from './limit-decimal.pipe';
import { LoaderComponent } from './loader/loader.component';
import { CustomAttributeCreatorComponent } from './main/custom-attributes-values-editor/custom-attribute-creator/custom-attribute-creator.component';
import { CustomAttributesValuesEditorComponent } from './main/custom-attributes-values-editor/custom-attributes-values-editor.component';
import { NumberWithCommasPipe } from './number-with-commas.pipe';
import { AccountsTableComponent } from './pinnakl-ui/accounts-table/accounts-table.component';
import { AddEditComponent } from './pinnakl-ui/add-edit/add-edit.component';
import { ConfirmAction } from './pinnakl-ui/confirm-action/confirm-action.component';
import { CustomScrollDirective } from './pinnakl-ui/custom-scroll.directive';
import { DndDirective } from './pinnakl-ui/dnd.directive';
import { DropdownButtonComponent } from './pinnakl-ui/dropdown-button/dropdown-button.component';
import { EditDeleteDropdownComponent } from './pinnakl-ui/edit-delete-dropdown/edit-delete-dropdown.component';
import { FileInputComponent } from './pinnakl-ui/file-input/file-input.component';
import { FilterPresetsComponent } from './pinnakl-ui/grid-filter/filter-presets/filter-presets.component';
import { FilterPresetsService } from './pinnakl-ui/grid-filter/filter-presets/filter-presets.service';
import { GridFilterComponent } from './pinnakl-ui/grid-filter/grid-filter.component';
import { LinkedContactSelectionComponent } from './pinnakl-ui/linked-contact-selection/linked-contact-selection.component';
import { ModalCloseButtonComponent } from './pinnakl-ui/modal-close-button/modal-close-button.component';
import { NameAvatarComponent } from './pinnakl-ui/name-avatar';
import { PeekTextComponent } from './pinnakl-ui/peek-text/peek-text.component';
import { PinnaklChipListComponent } from './pinnakl-ui/pinnakl-chip-list/pinnakl-chip-list.component';
import { PinnaklDonutChartComponent } from './pinnakl-ui/pinnakl-donut-chart/pinnakl-donut-chart.component';
import { PinnaklDateInputComponent } from './pinnakl-ui/pinnakl-input/pinnakl-date-input/pinnakl-date-input.component';
import { PinnaklDateTimeInputComponent } from './pinnakl-ui/pinnakl-input/pinnakl-date-time-input/pinnakl-date-time-input.component';
import { PinnaklDropdownComponent } from './pinnakl-ui/pinnakl-input/pinnakl-dropdown/pinnakl-dropdown.component';
import { PinnaklEditorComponent } from './pinnakl-ui/pinnakl-input/pinnakl-editor/pinnakl-editor.component';
import { PinnaklInputFloatingLabelComponent } from './pinnakl-ui/pinnakl-input/pinnakl-input-floating-label/pinnakl-input-floating-label.component';
import { PinnaklInputComponent } from './pinnakl-ui/pinnakl-input/pinnakl-input.component';
import { PinnaklSearchInputComponent } from './pinnakl-ui/pinnakl-input/pinnakl-search-input/pinnakl-search-input.component';
import { PinnaklTextAreaComponent } from './pinnakl-ui/pinnakl-input/pinnakl-text-area/pinnakl-text-area.component';
import { PinnaklTimeInputComponent } from './pinnakl-ui/pinnakl-input/pinnakl-time-input/pinnakl-time-input.component';
import { PinnaklNumFormatDirective } from './pinnakl-ui/pinnakl-numformat.directive';
import { PinnaklPageComponent } from './pinnakl-ui/pinnakl-page/pinnakl-page.component';
import { PinnaklPlaceAutocompleteComponent } from './pinnakl-ui/pinnakl-place-autocomplete/pinnakl-place-autocomplete.component';
import { PnklMenuDropdownComponent } from './pinnakl-ui/pnkl-menu-dropdown/pnkl-menu-dropdown.component';
import { PnklMultiselectDropdownComponent } from './pinnakl-ui/pnkl-multiselect-dropdown/pnkl-multiselect-dropdown.component';
import { PnklSelectComponent } from './pinnakl-ui/pnkl-select/pnkl-select.component';
import { PnklValidationComponent } from './pinnakl-ui/pnkl-validation/pnkl-validation.component';
import { PositionAndPriceGraphComponent } from './pinnakl-ui/position-and-price-graph';
import { PositionPriceGraph } from './pinnakl-ui/position-price-graph/position-price-graph.component';
import { RichTextAreaComponent } from './pinnakl-ui/rich-text-area.component';
import { RouteResolverComponent } from './pinnakl-ui/route-resolver/route-resolver.component';
import { RouterUrlLinkWithHref } from './pinnakl-ui/router-url-link.directive';
import { UniversalSearchComponent } from './pinnakl-ui/search-organizations/universal-search.component';
import { SecurityItemComponent } from './pinnakl-ui/security-items/security-item/security-item.component';
import { SecurityItemsComponent } from './pinnakl-ui/security-items/security-items.component';
import { SecuritySelectorComponent } from './pinnakl-ui/security-selector/security-selector.component';
import { StreamsStatusComponent } from './pinnakl-ui/streams-status/streams-status.component';
import { TabSelectorComponent } from './pinnakl-ui/tab-selector/tab-selector.component';
import { WideSearchComponent } from './pinnakl-ui/wide-search/wide-search.component';
import { PositionsLoadAllDataService } from './pinnakl-web-services';
import { AccountService } from './pinnakl-web-services/account.service';
import { AccountingService } from './pinnakl-web-services/accounting.service';
import { AuditLogService } from './pinnakl-web-services/audit.service';
import { BrokerService } from './pinnakl-web-services/broker.service';
import { ClientConnectivityService } from './pinnakl-web-services/client-connectivity.service';
import { CounterpartyRelationshipsService } from './pinnakl-web-services/counterparty-relationships.service';
import { CustodianService } from './pinnakl-web-services/custodian.service';
import { EMSTradeService } from './pinnakl-web-services/ems.service';
import { FileService } from './pinnakl-web-services/file.service';
import { FolderService } from './pinnakl-web-services/folder.service';
import { OMSService } from './pinnakl-web-services/oms.service';
import { PinnaklCommentService } from './pinnakl-web-services/pinnakl-comment.service';
import { PnlService } from './pinnakl-web-services/pnl.service';
import { PositionService } from './pinnakl-web-services/position.service';
import { PricingService } from './pinnakl-web-services/pricing.service';
import { RebalanceService } from './pinnakl-web-services/rebalance.service';
import { ClientReportColumnService } from './pinnakl-web-services/reporting/client-report-column.service';
import { ClientReportService } from './pinnakl-web-services/reporting/client-report.service';
import { IdcColumnsService } from './pinnakl-web-services/reporting/idc-columns.service';
import { ReportColumnService } from './pinnakl-web-services/reporting/report-column.service';
import { ReportingService } from './pinnakl-web-services/reporting/reporting.service';
import { UserReportColumnService } from './pinnakl-web-services/reporting/user-report-column.service';
import { UserReportCustomAttributeService } from './pinnakl-web-services/reporting/user-report-custom-attribute.service';
import { UserReportIdcColumnService } from './pinnakl-web-services/reporting/user-report-idc-column.service';
import { UserReportService } from './pinnakl-web-services/reporting/user-report.service';
import {
  BondCouponService,
  EquitySharesOutstandingService
} from './pinnakl-web-services/security';
import { AdminIdentifierService } from './pinnakl-web-services/security/admin-identifier.service';
import { BondService } from './pinnakl-web-services/security/bond.service';
import { CdsService } from './pinnakl-web-services/security/cds.service';
import { CountryService } from './pinnakl-web-services/security/country.service';
import { CurrencyService } from './pinnakl-web-services/security/currency.service';
import { CustomAttributesService } from './pinnakl-web-services/security/custom-attributes.service';
import { EquityService } from './pinnakl-web-services/security/equity.service';
import { FundService } from './pinnakl-web-services/security/fund.service';
import { FutureService } from './pinnakl-web-services/security/future.service';
import { LoanService } from './pinnakl-web-services/security/loan.service';
import { MarketService } from './pinnakl-web-services/security/market.service';
import { OptionService } from './pinnakl-web-services/security/option.service';
import { OrganizationService } from './pinnakl-web-services/security/organization.service';
import { PbIdentifierService } from './pinnakl-web-services/security/pb-identifier.service';
import { PreferredService } from './pinnakl-web-services/security/preferred.service';
import { PublicIdentifierService } from './pinnakl-web-services/security/public-identifier.service';
import { SecurityService } from './pinnakl-web-services/security/security.service';
import { TradeAllocationService } from './pinnakl-web-services/trade-allocation.service';
import { TradeService } from './pinnakl-web-services/trade.service';
import { PnklFilterPipe } from './pnkl-filter.pipe';
import {
  AccessControlService,
  EntityDurationValidationService,
  UniveralSearchService
} from './services';
import { MapsHelper } from './services/maps-helper.service';
import { Utility } from './services/utility.service';
import { SortByDatePipe } from './sort-by-date.pipe';
import { SpinnerComponent } from './spinner';

@NgModule({
  imports: [
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAapQqQUfUgTp2YoEVDeJbvpzUEqDcaTpg',
      libraries: ['places']
    }),
    ButtonsModule,
    CommonModule,
    ChartModule,
    ComboBoxModule,
    CurrencyMaskModule,
    DateInputsModule,
    DialogModule,
    EditorModule,
    FormsModule,
    // HttpClientModule,   //don't add HTTP Client more than once in your application otherwise interceptor won't be called
    MultiSelectModule,
    PinnaklModalModule,
    ReactiveFormsModule,
    PnklChartsModule,
    PopupModule,
    RouterModule,
    IndicatorsModule,
    LayoutModule,
    MatDialogModule
  ],
  declarations: [
    AddEditComponent,
    ConfirmAction,
    CropTextPipe,
    CustomScrollDirective,
    DndDirective,
    DropdownButtonComponent,
    EditDeleteDropdownComponent,
    FileInputComponent,
    GridFilterComponent,
    IterateOverObjectPipe,
    KeysPipe,
    LimitDecimalPipe,
    NameAvatarComponent,
    NumberWithCommasPipe,
    PeekTextComponent,
    PinnaklChipListComponent,
    PinnaklDateInputComponent,
    PinnaklDonutChartComponent,
    PinnaklDropdownComponent,
    PinnaklEditorComponent,
    PinnaklInputComponent,
    PinnaklInputFloatingLabelComponent,
    PinnaklNumFormatDirective,
    PinnaklPageComponent,
    PinnaklPlaceAutocompleteComponent,
    PinnaklSearchInputComponent,
    PinnaklTextAreaComponent,
    PinnaklTimeInputComponent,
    PnklFilterPipe,
    PnklMenuDropdownComponent,
    PnklMultiselectDropdownComponent,
    PnklSelectComponent,
    PnklValidationComponent,
    PositionPriceGraph,
    PositionAndPriceGraphComponent,
    RichTextAreaComponent,
    RouteResolverComponent,
    SecuritySelectorComponent,
    WideSearchComponent,
    ModalCloseButtonComponent,
    TabSelectorComponent,
    SecurityItemsComponent,
    SecurityItemComponent,
    SpinnerComponent,
    AccountsTableComponent,
    SortByDatePipe,
    FilterPresetsComponent,
    StreamsStatusComponent,
    CustomAttributeCreatorComponent,
    CustomAttributesValuesEditorComponent,
    UniversalSearchComponent,
    HighlightSearchPipe,
    RouterUrlLinkWithHref,
    LoaderComponent,
    LinkedContactSelectionComponent,
    PinnaklDateTimeInputComponent
  ],
  exports: [
    AddEditComponent,
    AgmCoreModule,
    ChartModule,
    ConfirmAction,
    CropTextPipe,
    CustomScrollDirective,
    DndDirective,
    DropdownButtonComponent,
    EditDeleteDropdownComponent,
    FileInputComponent,
    GridFilterComponent,
    IterateOverObjectPipe,
    KeysPipe,
    LimitDecimalPipe,
    NameAvatarComponent,
    NumberWithCommasPipe,
    PeekTextComponent,
    PinnaklChipListComponent,
    PinnaklDateInputComponent,
    PinnaklDonutChartComponent,
    PinnaklDropdownComponent,
    PinnaklEditorComponent,
    PinnaklInputComponent,
    PinnaklModalModule,
    PinnaklInputFloatingLabelComponent,
    PinnaklNumFormatDirective,
    PinnaklPageComponent,
    PinnaklPlaceAutocompleteComponent,
    PinnaklSearchInputComponent,
    PinnaklTextAreaComponent,
    PinnaklTimeInputComponent,
    PnklFilterPipe,
    PnklMenuDropdownComponent,
    PnklMultiselectDropdownComponent,
    PnklSelectComponent,
    PnklValidationComponent,
    PositionPriceGraph,
    PositionAndPriceGraphComponent,
    RichTextAreaComponent,
    RouteResolverComponent,
    SecuritySelectorComponent,
    WideSearchComponent,
    ModalCloseButtonComponent,
    TabSelectorComponent,
    SecurityItemsComponent,
    SecurityItemComponent,
    SpinnerComponent,
    AccountsTableComponent,
    SortByDatePipe,
    FilterPresetsComponent,
    StreamsStatusComponent,
    CustomAttributeCreatorComponent,
    CustomAttributesValuesEditorComponent,
    UniversalSearchComponent,
    HighlightSearchPipe,
    RouterUrlLinkWithHref,
    EditorModule,
    LoaderComponent,
    LinkedContactSelectionComponent,
    PinnaklDateTimeInputComponent
  ],
  providers: [
    AccountingService,
    AccountService,
    AdminIdentifierService,
    AuditLogService,
    BondCouponService,
    BondService,
    BrokerService,
    CdsService,
    ClientConnectivityService,
    ClientReportColumnService,
    ClientReportService,
    CounterpartyRelationshipsService,
    CountryService,
    CurrencyService,
    CustodianService,
    CustomAttributesService,
    EntityDurationValidationService,
    EquityService,
    EquitySharesOutstandingService,
    FileService,
    FolderService,
    FundService,
    FutureService,
    IdcColumnsService,
    LoanService,
    MapsHelper,
    MarketService,
    EMSTradeService,
    OMSService,
    OptionService,
    OrganizationService,
    PbIdentifierService,
    PinnaklCommentService,
    PnlService,
    PositionService,
    PreferredService,
    PricingService,
    PublicIdentifierService,
    RebalanceService,
    ReportColumnService,
    ReportingService,
    SecurityService,
    TradeAllocationService,
    TradeService,
    UserReportColumnService,
    UserReportCustomAttributeService,
    UserReportIdcColumnService,
    UserReportService,
    Utility,
    PositionsLoadAllDataService,
    FilterPresetsService,
    AccessControlService,
    UniveralSearchService
  ]
})
export class SharedModule {
  public static register(
    fileServiceUrl: string,
    httpServiceUrl: string
  ): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        {
          provide: FILE_SERVICE_URL,
          useValue: fileServiceUrl
        },
        {
          provide: HTTP_SERVICE_URL,
          useValue: httpServiceUrl
        }
      ]
    };
  }
}
