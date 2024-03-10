import {Currency} from "./currency";


export class ShareheadEstimation {

    constructor(
        public date: Date,
        public year: number,
        public sales: number,
        public profitPerShare: number,
        public profit: number,
        public equityRatio: number,
        public dividend: number,
        public avgRate: number,
        public currency?: Currency,
        public analysts?: number,
    ) {}


    returnOnSales(currency?: Currency): number
    {
        return +(100 / this.currencyCorrectedSales(currency) * this.currencyCorrectedProfit(currency)).toFixed(1);
    }

    currencyCorrectedSales(currency?: Currency): number
    {
        let result = this.sales;
        if (this.currency && currency && +currency.id !== +this.currency.id) {
            result = this.sales * currency.rate / this.currency.rate;
        }

        return +result.toFixed(0);
    }

    currencyCorrectedProfitPerShare(currency?: Currency): number
    {
        let result = this.profitPerShare;
        if (this.currency && currency && +currency.id !== +this.currency.id) {
            result = this.profitPerShare * currency.rate / this.currency.rate;
        }

        return +result.toFixed(2);
    }

    currencyCorrectedDividend(currency?: Currency): number
    {
        let result = this.dividend;
        if (this.currency && currency && +currency.id !== +this.currency.id) {
            result = this.dividend * currency.rate / this.currency.rate;
        }

        return +result.toFixed(2);
    }

    currencyCorrectedProfit(currency?: Currency): number
    {
        let result = this.profit;
        if (this.currency && currency && +currency.id !== +this.currency.id) {
            result = this.profit * currency.rate / this.currency.rate;
        }

        return +result.toFixed(1);
    }

}
