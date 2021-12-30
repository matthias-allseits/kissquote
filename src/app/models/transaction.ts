export class Transaction {

    constructor(
        public id: number,
        public date: Date|null,
        public quantity: number,
        public rate: number|null,
        public fee: number|null,
        public isFee: boolean = false,
        public isInterest: boolean = false,
    ) {}

}
