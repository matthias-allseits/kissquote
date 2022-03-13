import {Transaction} from "../models/transaction";
import {PositionCreator} from "./position-creator";
import {CurrencyCreator} from "./currency-creator";


export class TransactionCreator {

    public static createNewTransaction(): Transaction {
        return new Transaction(0, null, '', new Date(), 0, null, null);
    }

    public static fromApiArray(apiArray: Transaction[]): Transaction[] {
        const array: Transaction[] = [];

        for (const transactionList of apiArray) {
            const transaction = this.oneFromApiArray(transactionList);
            if (null !== transaction) {
                array.push(transaction);
            }
        }
        array.sort((a,b) => (a.date < b.date) ? 1 : ((b.date < a.date) ? -1 : 0))

        return array;
    }


    public static oneFromApiArray(apiArray: Transaction): Transaction|null
    {
        if (apiArray !== undefined) {
            return new Transaction(
                apiArray.id,
                apiArray.position ? PositionCreator.oneFromApiArray(apiArray.position) : null,
                apiArray.title,
                new Date(apiArray.date),
                apiArray.quantity,
                apiArray.rate,
                apiArray.fee,
                apiArray.isFee,
                apiArray.isInterest,
                apiArray.currency ? CurrencyCreator.oneFromApiArray(apiArray.currency) : undefined,
            );
        } else {
            return null;
        }
    }

}
