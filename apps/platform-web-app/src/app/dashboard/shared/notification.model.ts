export class Notification {
  constructor(
    public id: number,
    public notification: string,
    public notificationType: number,
    public notificationTypeDescription: string,
    public runDateTime: Date
  ) {}
}
