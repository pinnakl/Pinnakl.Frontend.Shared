export class Holiday {
  constructor(public id: number, public holidayDate: Date) {}
}

export class HolidayFromApi {
  constructor(public id: string, public holidaydate: string) {}
}
