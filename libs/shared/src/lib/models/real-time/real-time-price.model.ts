export class RealTimePrice {
  constructor(
    public ClientId: number,
    public EvalTime: string,
    public PriceType: string, // bid ask
    public SecurityId: number,
    public Value: number
  ) {}
}
