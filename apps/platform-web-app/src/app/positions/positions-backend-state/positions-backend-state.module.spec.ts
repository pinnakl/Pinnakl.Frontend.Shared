import { PositionsBackendStateModule } from './positions-backend-state.module';

describe('PositionsBackendStateModule', () => {
  let positionsBackendStateModule: PositionsBackendStateModule;

  beforeEach(() => {
    positionsBackendStateModule = new PositionsBackendStateModule();
  });

  it('should create an instance', () => {
    expect(positionsBackendStateModule).toBeTruthy();
  });
});
