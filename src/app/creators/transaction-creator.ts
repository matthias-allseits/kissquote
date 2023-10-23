import {Transaction} from "../models/transaction";
import {PositionCreator} from "./position-creator";
import {CurrencyCreator} from "./currency-creator";


export class TransactionCreator {

    public static createNewTransaction(): Transaction {
        return new Transaction(0, '', new Date(), 0, null, null);
    }

    public static fromApiArray(apiArray: Transaction[]): Transaction[] {
        const array: Transaction[] = [];

        for (const transactionList of apiArray) {
            const transaction = this.oneFromApiArray(transactionList);
            if (transaction) {
                array.push(transaction);
            }
        }
        array.sort((a,b) => (a.date < b.date) ? 1 : ((b.date < a.date) ? -1 : 0));

        return array;
    }


    public static oneFromApiArray(apiArray: Transaction): Transaction|undefined
    {
        let position = PositionCreator.oneFromApiArray(apiArray.position);
        if (apiArray !== undefined) {
            return new Transaction(
                apiArray.id,
                apiArray.title,
                new Date(apiArray.date),
                apiArray.quantity,
                apiArray.rate,
                apiArray.fee,
                apiArray.isFee,
                apiArray.isInterest,
                position ? position : undefined,
                apiArray.currency ? CurrencyCreator.oneFromApiArray(apiArray.currency) : undefined,
            );
        } else {
            return undefined;
        }
    }

}
