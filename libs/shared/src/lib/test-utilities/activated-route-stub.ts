export class ActivatedRouteStub {
  snapshot = {};

  setSnapShot(data: any): void {
    this.snapshot = { data: data };
  }

  setSnapShotUrl(url: string): void {
    this.snapshot['url'] = url;
  }
}
