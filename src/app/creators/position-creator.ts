import {Position} from "../models/position";
import {CurrencyCreator} from "./currency-creator";
import {ShareCreator} from "./share-creator";
import {TransactionCreator} from "./transaction-creator";
import {BalanceCreator} from "./balance-creator";
import {BankAccountCreator} from "./bank-account-creator";
import {LabelCreator} from "./label-creator";
import {SectorCreator} from "./sector-creator";


export class PositionCreator {

    public static createNewPosition(): Position {
        return new Position(0, null, true, new Date(), null, [], false, '', 0);
    }

    public static fromApiArray(apiArray: Position[]): Position[] {
        const array: Position[] = [];

        for (const PositionList of apiArray) {
            const position = this.oneFromApiArray(PositionList);
            if (null !== position) {
                array.push(position);
            }
        }
        array.sort((a,b) => (a.activeFrom > b.activeFrom) ? 1 : ((b.activeFrom > a.activeFrom) ? -1 : 0))

        return array;
    }


    public static oneFromApiArray(apiArray: Position): Position|null
    {
        if (apiArray !== undefined) {
            return new Position(
                apiArray.id,
                ShareCreator.oneFromApiArray(apiArray.share),
                apiArray.active,
                new Date(apiArray.activeFrom),
                apiArray.activeUntil ? new Date(apiArray.activeUntil) : null,
                apiArray.transactions ? TransactionCreator.fromApiArray(apiArray.transactions) : [],
                apiArray.isCash,
                apiArray.dividendPeriodicity,
                0,
                apiArray.bankAccount ? BankAccountCreator.oneFromApiArray(apiArray.bankAccount) : undefined,
                apiArray.sector ? SectorCreator.oneFromApiArray(apiArray.sector) : undefined,
                CurrencyCreator.oneFromApiArray(apiArray.currency),
                apiArray.balance ? BalanceCreator.oneFromApiArray(apiArray.balance) : undefined,
                apiArray.shareheadId,
                apiArray.manualDrawdown ? apiArray.manualDrawdown : undefined,
                apiArray.labels ? LabelCreator.fromApiArray(apiArray.labels) : undefined
            );
        } else {
            return null;
        }
    }

}
