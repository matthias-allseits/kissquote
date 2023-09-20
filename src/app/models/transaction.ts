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
        public positionId?: number,
        public assetName?: string,
    ) {}

    isDividend(): boolean {
        const dividendTitles = ['Dividende', 'Capital Gain', 'Kapitalrückzahlung'];
        return dividendTitles.indexOf(this.title) > -1;
    }

    total(): number {
        let result = 0;

        if (this.rate) {
            result = (this.quantity * this.rate);
        }
        if (this.fee) {
            result += this.fee;
        }

        return result;
    }

    netTotal(): number {
        let result = 0;

        if (this.rate) {
            result = (this.quantity * this.rate);
        }
        if (this.fee) {
            result -= this.fee;
        }

        return result;
    }

    isRealTransaction(): boolean
    {
        let result = false;
        const realTransactions = ['Kauf', 'Verkauf'];

        if (realTransactions.indexOf(this.title) > -1) {
            result = true;
        }

        return result;
    }

}
