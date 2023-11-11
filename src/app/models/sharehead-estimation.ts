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


    returnOnSales(): number
    {
        return +(100 / this.sales * this.profit).toFixed(1);
    }

}
