export class CountryFromApi {
  constructor(
    public code: string,
    public id: string,
    public name: string,
    public region: string,
    public subRegion: string
  ) {}
}
