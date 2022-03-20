import {StockRate} from "./stock-rate";


export class Balance {

    constructor(
    public amount: number,
    public firstRate: number,
    public averagePayedPriceGross: number,
    public averagePayedPriceNet: number,
    public investment: number,
    public transactionFeesTotal: number,
    public collectedDividends: number,
    public collectedDividendsCurrency: string,
    public projectedNextDividendPayment: number,
    public projectedNextDividendCurrency: string,
    public lastRate?: StockRate,
    public cashValue?: number,
    public closedResult?: number,
    ) {}


    returnOnInvestentByDividends(): string
    {
        return (100 / this.investment * this.collectedDividends).toFixed(1);
    }


    projectedNextDividendPerShare(): number
    {
        return this.projectedNextDividendPayment / this.amount;
    }

}
