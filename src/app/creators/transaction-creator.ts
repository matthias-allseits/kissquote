import {Transaction} from "../models/transaction";


export class TransactionCreator {

    public static createNewTransaction(): Transaction {
        return new Transaction(0, null, null, null, null);
    }

    public static fromApiArray(apiArray: Transaction[]): Transaction[] {
        const array: Transaction[] = [];

        for (const TransactionList of apiArray) {
            const transaction = this.oneFromApiArray(TransactionList);
            if (null !== transaction) {
                array.push(transaction);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: Transaction): Transaction|null
    {
        if (apiArray !== undefined) {
            return new Transaction(
                apiArray.id,
                apiArray.date,
                apiArray.quantity,
                apiArray.rate,
                apiArray.fee,
            );
        } else {
            return null;
        }
    }

}
