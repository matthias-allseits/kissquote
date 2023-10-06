import {ShareheadShare} from "./sharehead-share";
import {Analyst} from "./analyst";
import {Currency} from "./currency";


export class AnalystRating {

    constructor(
        public id: number,
        public date: Date,
        public priceTarget: number|null,
        public analyst?: Analyst,
        public currency?: Currency,
        public rating?: string,
        public source?: string,
        public share?: ShareheadShare,
        public positionId?: number,
    ) { }

    public isPositive(): boolean {
        return this.rating === 'buy' || this.rating === 'strong buy';
    }

    public isNeutral(): boolean {
        return this.rating === 'hold';
    }

    public isNegative(): boolean {
        return !this.isPositive() && !this.isNeutral();
    }

}
