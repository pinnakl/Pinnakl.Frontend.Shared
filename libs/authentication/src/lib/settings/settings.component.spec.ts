import { SettingsComponent, SettingsTabs } from './settings.component';

describe('ChangeAuthenticationComponent', () => {
  let component: SettingsComponent;

  beforeEach(() => {
    component = new SettingsComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('switchTab method', () => {
    it('set accountSettings tab', () => {
      component.switchTab(SettingsTabs.accountSettings);
      expect(component.currentTab).toEqual(SettingsTabs.accountSettings);
    });
    it('set loginSecurity tab', () => {
      component.switchTab(SettingsTabs.loginSecurity);
      expect(component.currentTab).toEqual(SettingsTabs.loginSecurity);
    });
    it('set notifications tab', () => {
      component.switchTab(SettingsTabs.notifications);
      expect(component.currentTab).toEqual(SettingsTabs.notifications);
    });
    it('set accessControl tab', () => {
      component.switchTab(SettingsTabs.accessControl);
      expect(component.currentTab).toEqual(SettingsTabs.accessControl);
    });
  });
});
