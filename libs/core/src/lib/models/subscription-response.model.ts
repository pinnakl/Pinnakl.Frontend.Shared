export class SubscriptionResponse<T> {
  public action: 'DELETE' | 'NOTIFY' | 'POST' | 'PUT';
  public body: T;
}
