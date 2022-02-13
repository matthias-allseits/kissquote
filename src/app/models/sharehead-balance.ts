import {Currency} from "./currency";


export class ShareheadBalance {

    constructor(
    public date: Date,
    public year: number,
    public currency: Currency|null,
    public sales: number,
    public profitPerShare: number,
    public profit: number,
    public equityRatio: number,
    public dividend: number,
    public avgRate: number,
    ) {}

}
