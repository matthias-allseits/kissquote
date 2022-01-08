import {Position} from "./position";

export class Transaction {

    constructor(
        public id: number,
        public position: Position|null,
        public title: string = '',
        public date: Date,
        public quantity: number,
        public rate: number|null,
        public fee: number|null,
        public isFee: boolean = false,
        public isInterest: boolean = false,
    ) {}

}
