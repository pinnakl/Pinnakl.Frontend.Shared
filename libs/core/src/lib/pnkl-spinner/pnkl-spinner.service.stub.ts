export class PinnaklSpinnerStub {
  visible = false;
  spin(): void {
    this.visible = true;
  }
  stop(): void {
    this.visible = false;
  }
}
