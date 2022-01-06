import {Currency} from './currency';
import {Share} from './share';
import {Transaction} from "./transaction";
import {BankAccount} from "./bank-account";


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
        public bankAccount?: BankAccount,
    ) {}


    public getName(): string {
        if (this.share && this.share.name) {
            return this.share.name;
        } else {
            return 'undefined';
        }
    }


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
