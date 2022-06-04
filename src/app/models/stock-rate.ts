export class StockRate {

    constructor(
        public id: number,
        public date: Date,
        public rate: number,
        public open: number,
        public high: number,
        public low: number,
        public currency: string,
    ) {}

}
