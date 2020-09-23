export class NotificationFromApi {
  constructor(
    public id: string,
    public iso8601rundatetime: string,
    public notification: string,
    public notificationtype: string,
    public notificationtypedescription: string
  ) {}
}
