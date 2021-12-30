import {Dividend} from "../models/dividend";
import {ShareCreator} from "./share-creator";


export class DividendCreator {

    public static createNewDividend(): Dividend {
        return new Dividend(0, null, null, null, null);
    }

    public static fromApiArray(apiArray: Dividend[]): Dividend[] {
        const array: Dividend[] = [];

        for (const TransactionList of apiArray) {
            const transaction = this.oneFromApiArray(TransactionList);
            if (null !== transaction) {
                array.push(transaction);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: Dividend): Dividend|null
    {
        if (apiArray !== undefined) {
            return new Dividend(
                apiArray.id,
                ShareCreator.oneFromApiArray(apiArray.share),
                apiArray.date,
                apiArray.valueNet,
                apiArray.valueGross,
            );
        } else {
            return null;
        }
    }

}
