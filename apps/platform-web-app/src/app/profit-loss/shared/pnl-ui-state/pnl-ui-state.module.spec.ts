import { PnlUiStateModule } from './pnl-ui-state.module';

describe('PnlUiStateModule', () => {
  let pnlUiStateModule: PnlUiStateModule;

  beforeEach(() => {
    pnlUiStateModule = new PnlUiStateModule();
  });

  it('should create an instance', () => {
    expect(pnlUiStateModule).toBeTruthy();
  });
});
