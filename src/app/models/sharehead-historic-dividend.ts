import {Currency} from "./currency";

export class ShareheadHistoricDividend {

    constructor(
        public id: number,
        public year: number,
        public dividend: number,
        public currency?: Currency,
    ) {}

}
