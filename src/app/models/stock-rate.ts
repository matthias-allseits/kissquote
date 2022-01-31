export class StockRate {

    constructor(
        public id: number,
        public date: Date|null,
        public rate: number,
        public currency: string,
    ) {}

}
