

export class Balance {

    constructor(
    public amount: number,
    public firstRate: number,
    public averagePayedPriceGross: number,
    public averagePayedPriceNet: number,
    public investment: number,
    public transactionFeesTotal: number,
    ) {}

}
