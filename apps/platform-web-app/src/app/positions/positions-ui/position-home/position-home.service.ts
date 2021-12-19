import { Injectable } from '@angular/core';
import { UserService, WebServiceProvider } from '@pnkl-frontend/core';
import { Broker, RebalanceConfigModel, RebalanceOrderModel, Security } from '@pnkl-frontend/shared';
import { isEmpty } from 'lodash';
import { BehaviorSubject, combineLatest, from, Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

export enum PresetType {
  PMS_ORDER_CONFIG = 'pms_order_config',
  PMS_GRID_CONFIG = 'pms_grid_config',
  PMS_WIDGET_CONFIG = 'pms_widget_config',
  SELECTED_PMS_GRID_CONFIG_ID = 'selected_pms_grid_config_id',
  SELECTED_PMS_WIDGET_CONFIG_ID = 'selected_pms_widget_config_id',
  PMS_GRID_FONT_SIZE = 'pms_grid-font-size'
}

export interface PmsUserListOrder {
  position: number;
  value: string;
}

export interface PMSConfig {
  order: PmsUserListOrder[];
  grid: any[];
  widget: any[];
  selectedGrid: any;
  selectedWidget: any;
}

export enum PMSConfigType {
  GRID = 'GRID',
  WIDGET = 'WIDGET',
}

export interface SavePresetFormData {
  presetName: string;
  presetType: PMSConfigType;
}

@Injectable({
  providedIn: 'root'
})
export class PositionHomeService {
  private readonly _userModuleConfigsEndpoint = 'entities/user_module_configs';
  // Stored ID of config which is responsible for storing last selected preset
  public orderConfigId: string;
  public selectedPmsGridConfig: { id: string; selectedId: string };
  public selectedPmsWidgetConfig: { id: string; selectedId: string };
  public readonly pmsPresetModule = 'PMS';

  brokers$ = new BehaviorSubject<Broker[]>([]);
  securities$ = new BehaviorSubject<Security[]>([]);
  pmsRebalanceConfig$ = new BehaviorSubject<RebalanceConfigModel>(null);
  selectedPositionOrders$ = new BehaviorSubject<RebalanceOrderModel[]>(null);
  positionsSelectedOrdersTrigger$ = new BehaviorSubject<boolean>(false);
  positionsResetOrdersTrigger$ = new BehaviorSubject<boolean>(false);
  pmsSelectedGridPresetConfig$ = new BehaviorSubject<any>(null);
  pmsGridFontSizeConfig$ = new BehaviorSubject<{fontSize: number, id?: string}>({ fontSize: 13 });

  constructor(
    private readonly wsp: WebServiceProvider,
    private readonly userService: UserService
  ) {
  }

  getSavedPMSPreset(): Observable<PMSConfig> {
    return combineLatest([
      from(this.getPMSConfig(PresetType.PMS_ORDER_CONFIG)).pipe(map(getParsedPresetConfigs)),
      from(this.getPMSConfig(PresetType.PMS_GRID_CONFIG)).pipe(map(getParsedPresetConfigs)),
      from(this.getPMSConfig(PresetType.PMS_WIDGET_CONFIG)).pipe(map(getParsedPresetConfigs)),
      from(this.getPMSConfig(PresetType.SELECTED_PMS_GRID_CONFIG_ID)).pipe(map(getParsedSelectedPresetConfigs)),
      from(this.getPMSConfig(PresetType.SELECTED_PMS_WIDGET_CONFIG_ID)).pipe(map(getParsedSelectedPresetConfigs)),
      from(this.getPMSConfig(PresetType.PMS_GRID_FONT_SIZE)).pipe(map(getParsedPresetConfigs))
    ]).pipe(map(([ orders, grid, widget, selectedGrid, selectedWidget, fontSize ]) => {
      // Order config
      const order = orders && Array.isArray(orders) && orders.length ? orders[0] : null;
      if (order) {
        this.orderConfigId = order.id;
      }

      // Widget config
      if (selectedWidget && !widget) {
        this.deletePreset(selectedWidget.id);
      } else {
        this.selectedPmsWidgetConfig = selectedWidget;
      }

      // Grid config
      if (selectedGrid && !grid) {
        this.deletePreset(selectedGrid.id);
      } else {
        this.selectedPmsGridConfig = selectedGrid;
      }

      if (!isEmpty(fontSize) && !isEmpty(fontSize[0])) {
        this.pmsGridFontSizeConfig$.next(fontSize[0]);
      }

      return {
        order: order?.columnsOrder, grid, widget, selectedGrid, selectedWidget
      };
    }));
  }

  createPreset<T>(preset: any, type: PresetType): Observable<T[] | any> {
    return from(this.wsp.postHttp<any>({ endpoint: this._userModuleConfigsEndpoint, body: preset }))
      .pipe(map((res => {
        if (!isEmpty(res)) {
          switch (type) {
            case PresetType.PMS_ORDER_CONFIG:
            case PresetType.PMS_GRID_CONFIG:
            case PresetType.PMS_WIDGET_CONFIG: return getParsedPresetConfigs([res]);
            case PresetType.SELECTED_PMS_GRID_CONFIG_ID:
            case PresetType.SELECTED_PMS_WIDGET_CONFIG_ID: return getParsedSelectedPresetConfigs([res]);
          }
        } else {
          return null;
        }
      })));
  }

  updatePreset<T>(preset: any, type: PresetType): Observable<T[] | any> {
    return from(this.wsp.putHttp<any>({ endpoint: this._userModuleConfigsEndpoint, body: preset }))
      .pipe(map((res => {
        if (!isEmpty(res)) {
          switch (type) {
            case PresetType.PMS_ORDER_CONFIG:
            case PresetType.PMS_GRID_CONFIG:
            case PresetType.PMS_WIDGET_CONFIG: return getParsedPresetConfigs([res]);
            case PresetType.SELECTED_PMS_GRID_CONFIG_ID:
            case PresetType.SELECTED_PMS_WIDGET_CONFIG_ID: return getParsedSelectedPresetConfigs([res]);
          }
        } else {
          return null;
        }
      })));
  }

  createGridOrWidgetConfig(data: any, presetType: PresetType.PMS_GRID_CONFIG | PresetType.PMS_WIDGET_CONFIG): Observable<any> {
    const selectedType = presetType === PresetType.PMS_GRID_CONFIG ?
      PresetType.SELECTED_PMS_GRID_CONFIG_ID : PresetType.SELECTED_PMS_WIDGET_CONFIG_ID;

    return this.createPreset(this.generatePresetConfig(data, presetType), presetType).pipe(
      concatMap(([createdPreset]) => this.saveCreatedPresetAsSelected(createdPreset, selectedType))
    );
  }

  saveOrderConfig(order: PmsUserListOrder[]): Observable<PmsUserListOrder[]> {
    const commandName = this.orderConfigId ? 'updatePreset' : 'createPreset';

    const dataToSend = this.generatePresetConfig({
      columnsOrder: order
    }, PresetType.PMS_ORDER_CONFIG);

    return this[commandName]({ ...dataToSend, id: this.orderConfigId || undefined },
      PresetType.PMS_ORDER_CONFIG
    );
  }

  async deletePreset(presetId: string): Promise<any> {
    return this.wsp.deleteHttp<any>({
      endpoint: `${this._userModuleConfigsEndpoint}/${presetId}`
    }).catch(e => {
      console.error('Something went wrong during deleting preset');
      console.error(e);
      throw e;
    });
  }

  saveCreatedPresetAsSelected(
    createdPreset: any,
    selectedType: PresetType.SELECTED_PMS_GRID_CONFIG_ID | PresetType.SELECTED_PMS_WIDGET_CONFIG_ID
  ): Observable<any> {
    const functionToExecute = this.getFunctionToExecuteName(selectedType);
    const dataToSend = this.generatePresetConfig({
      selectedId: createdPreset.id
    }, selectedType);

    if (functionToExecute === 'updatePreset') {
      if (selectedType === PresetType.SELECTED_PMS_GRID_CONFIG_ID) {
        dataToSend.id = this.selectedPmsGridConfig.id;
      } else {
        dataToSend.id = this.selectedPmsWidgetConfig.id;
      }
    }

    return this[functionToExecute](dataToSend, selectedType);
  }

  generatePresetConfig(data: any, type: PresetType): any {
    return {
      userid: this.userService.getUser().id.toString(),
      module: this.pmsPresetModule,
      configname: type,
      configvalue: JSON.stringify(data)
    };
  }

  private getPMSConfig(type: PresetType): Promise<any> {
    return this.wsp.getHttp<any[]>({
      endpoint: this._userModuleConfigsEndpoint,
      params: {
        fields: [ 'id', 'userid', 'module', 'configname', 'configvalue' ],
        filters: [
          {
            key: 'userid',
            type: 'EQ',
            value: [ this.userService.getUser().id.toString() ]
          },
          {
            key: 'configname',
            type: 'EQ',
            value: [ type ]
          },
          {
            key: 'module',
            type: 'EQ',
            value: [ this.pmsPresetModule ]
          }
        ]
      }
    });
  }

  private getFunctionToExecuteName(
    selectedType: PresetType.SELECTED_PMS_GRID_CONFIG_ID | PresetType.SELECTED_PMS_WIDGET_CONFIG_ID
  ): string {
    const selectedPmsItemConfigId = selectedType === PresetType.SELECTED_PMS_GRID_CONFIG_ID ?
      this.selectedPmsGridConfig?.id : this.selectedPmsWidgetConfig?.id;

    return selectedPmsItemConfigId ? 'updatePreset' : 'createPreset';
  }
}

function getParsedPresetConfigs(presets: any): any[] {
  return !isEmpty(presets[0]) ? presets.map(p => ({
    ...JSON.parse(p.configvalue),
    id: p.id
  })) : null;
}

function getParsedSelectedPresetConfigs(presets: any): any {
  return !isEmpty(presets[0]) ? presets.map(p => ({
    ...JSON.parse(p.configvalue),
    id: p.id
  }))[0] : null;
}
