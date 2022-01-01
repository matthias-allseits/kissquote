import {Position} from "../models/position";
import {CurrencyCreator} from "./currency-creator";
import {ShareCreator} from "./share-creator";
import {TransactionCreator} from "./transaction-creator";


export class PositionCreator {

    public static createNewPosition(): Position {
        return new Position(0, null, null, true, new Date(), null, []);
    }

    public static fromApiArray(apiArray: Position[]): Position[] {
        const array: Position[] = [];

        for (const PositionList of apiArray) {
            const position = this.oneFromApiArray(PositionList);
            if (null !== position) {
                array.push(position);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: Position): Position|null
    {
        if (apiArray !== undefined) {
            return new Position(
                apiArray.id,
                ShareCreator.oneFromApiArray(apiArray.share),
                CurrencyCreator.oneFromApiArray(apiArray.currency),
                apiArray.active,
                apiArray.activeFrom,
                apiArray.activeUntil,
                apiArray.transactions ? TransactionCreator.fromApiArray(apiArray.transactions) : [],
                apiArray.isCash
            );
        } else {
            return null;
        }
    }

}
