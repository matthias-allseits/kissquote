
export class AnalystRating {

    constructor(
        public id: number,
        public analyst: string|any,
        public currency: string|any,
        public date: Date,
        public priceTarget: number|null,
        public rating?: string,
    ) { }

    public isPositive(): boolean {
        return this.rating === 'buy' || this.rating === 'strong buy';
        // {% if rating.rating == 'buy' or rating.rating == 'strong buy' %}green-text{% elseif rating.rating == 'hold' %}yellow-text{% else %}red-text{% endif %}
    }

    public isNeutral(): boolean {
        return this.rating === 'hold';
    }

    public isNegative(): boolean {
        return !this.isPositive() && !this.isNeutral();
    }

}
