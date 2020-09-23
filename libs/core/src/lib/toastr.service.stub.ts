export class ToastrStub {
  error(message: string, title?: string, options?: any): void {
    console.log(message + '\n' + title + '\n' + options); // tslint:disable-line: no-console
  }

  info(message: string, title?: string, options?: any): void {
    console.log(message + '\n' + title + '\n' + options); // tslint:disable-line: no-console
  }

  success(message: string, title?: string, options?: any): void {
    console.log(message + '\n' + title + '\n' + options); // tslint:disable-line: no-console
  }

  warning(message: string, title?: string, options?: any): void {
    console.log(message + '\n' + title + '\n' + options); // tslint:disable-line: no-console
  }
}
