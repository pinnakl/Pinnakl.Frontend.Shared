export class UserFromApi {
  constructor(
    public clientid: string,
    public features: string,
    public firstname: string,
    public id: string,
    public lastname: string,
    public token: string,
    public username: string
  ) {}
}
