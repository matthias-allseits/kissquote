import {Currency} from "./currency";


export class ShareheadBalance {

    constructor(
        public date: Date,
        public year: number,
        public sales: number,
        public profitPerShare: number,
        public profit: number,
        public equityRatio: number,
        public dividend: number,
        public avgRate: number,
        public equity: number,
        public currency?: Currency,
        public debtNet?: number,
        public ordinarySharesNumber?: number,
        public treasurySharesNumber?: number,
        public goodwillAndCrap?: number,
        public cash?: number,
        public lastYearEquity?: number,
    ) {}


    returnOnSales(): number
    {
        return +(100 / this.sales * this.profit).toFixed(1);
    }

    averageEquity(): number|null
    {
        if (this.lastYearEquity && this.equity > 0) {
            return +((this.lastYearEquity + this.equity) / 2).toFixed(0);
        }

        return null;
    }

    returnOnEquity(): number|null
    {
        const averageEquity = this.averageEquity();
        if (averageEquity) {
            return +(100 / averageEquity * this.profit).toFixed(1);
        }

        return null;
    }

    netDebtRatio(): number|null
    {
        if (this.profit > 0 && this.debtNet && this.debtNet > 0) {
            return +((this.debtNet / 1000) / this.profit).toFixed(1);
        }

        return null;
    }

}
