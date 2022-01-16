

export class Balance {

    constructor(
    public amount: number,
    public firstRate: number,
    public averagePayedPriceGross: number,
    public averagePayedPriceNet: number,
    public investment: number,
    public transactionFeesTotal: number,
    public collectedDividends: number,
    public projectedNextDividendPayment: number,
    ) {}


    returnOnInvestentByDividends(): string
    {
        return (100 / this.investment * this.collectedDividends).toFixed(1);
    }

}
