export class User {
  constructor(
    public clientId: number,
    public features: string[],
    public firstName: string,
    public fullName: string,
    public id: number,
    public lastName: string,
    public token: string,
    public username: string
  ) {}
}
