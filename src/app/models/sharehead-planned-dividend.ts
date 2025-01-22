import {Currency} from "./currency";


export class ShareheadPlannedDividend {

    constructor(
        public id: number,
        public declarationDate: Date|undefined,
        public exDate: Date,
        public payDate: Date,
        public amount: number,
        public currency?: Currency,
    ) {}

}
