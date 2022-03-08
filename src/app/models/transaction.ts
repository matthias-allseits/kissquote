import {Position} from "./position";
import {Currency} from "./currency";

export class Transaction {

    constructor(
        public id: number,
        public position: Position|null,
        public title: string = '',
        public date: Date|string,
        public quantity: number,
        public rate: number|null,
        public fee: number|null,
        public isFee: boolean = false,
        public isInterest: boolean = false,
        public currency?: Currency,
    ) {}

}
