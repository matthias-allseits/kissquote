import {ShareheadShare} from "./sharehead-share";

export class AnalystRating {

    constructor(
        public id: number,
        public analyst: string|any,
        public currency: string|any,
        public date: Date,
        public priceTarget: number|null,
        public rating?: string,
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
