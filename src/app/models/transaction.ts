import {Position} from "./position";
import {Currency} from "./currency";


export class Transaction {

    constructor(
        public id: number,
        public title: string = '',
        public date: Date|string,
        public quantity: number,
        public rate: number|null,
        public fee: number|null,
        public isFee: boolean = false,
        public isInterest: boolean = false,
        public position?: Position,
        public currency?: Currency,
    ) {}

    isDividend(): boolean {
        const dividendTitles = ['Dividende', 'Capital Gain', 'Kapitalrückzahlung'];
        return dividendTitles.indexOf(this.title) > -1;
    }

}
