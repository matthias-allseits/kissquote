import {Currency} from './currency';
import {Share} from './share';
import {Transaction} from "./transaction";

export class Position {

    constructor(
        public id: number,
        public share: Share|null,
        public currency: Currency|null,
        public active: boolean,
        public activeFrom: Date|null,
        public activeUntil: Date|null,
        public transactions: Transaction[],
        public isCash: boolean = false,
    ) {}


    public quantityTotal(): number {
        let quantity = 0;
        this.transactions.forEach(transaction => {
            quantity += transaction.quantity;
        });

        return quantity;
    }


    public valuation(): number {
        let value = 0;
        this.transactions.forEach(transaction => {
            if (transaction.rate) {
                value += transaction.quantity * transaction.rate;
            }
        });

        return value;
    }

}
