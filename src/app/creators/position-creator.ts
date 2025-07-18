import {Position} from "../models/position";
import {CurrencyCreator} from "./currency-creator";
import {ShareCreator} from "./share-creator";
import {TransactionCreator} from "./transaction-creator";
import {BalanceCreator} from "./balance-creator";
import {BankAccountCreator} from "./bank-account-creator";
import {LabelCreator} from "./label-creator";
import {SectorCreator} from "./sector-creator";
import {PositionLogCreator} from "./position-log-creator";
import {StrategyCreator} from "./strategy-creator";


export class PositionCreator {

    public static createNewPosition(): Position {
        return new Position(0, null, true, new Date(), null, [], [], false, '', 0);
    }

    public static fromApiArray(apiArray: Position[], accountName?: string): Position[] {
        const array: Position[] = [];

        for (const PositionList of apiArray) {
            const position = this.oneFromApiArray(PositionList, accountName);
            if (undefined !== position) {
                array.push(position);
            }
        }
        array.sort((a,b) => (a.activeFrom > b.activeFrom) ? 1 : ((b.activeFrom > a.activeFrom) ? -1 : 0))

        return array;
    }


    public static oneFromApiArray(apiArray?: Position|undefined, accountName?: string): Position|undefined
    {
        if (apiArray && apiArray.markedLines) {
            try {
                JSON.parse(apiArray.markedLines.toString());
            } catch (e) {
                apiArray.markedLines = undefined;
            }
        }
        if (apiArray !== undefined && apiArray !== null) {
            return new Position(
                apiArray.id,
                ShareCreator.oneFromApiArray(apiArray.share),
                apiArray.active,
                new Date(apiArray.activeFrom),
                apiArray.activeUntil ? new Date(apiArray.activeUntil) : null,
                apiArray.transactions ? TransactionCreator.fromApiArray(apiArray.transactions) : [],
                apiArray.logEntries ? PositionLogCreator.fromApiArray(apiArray.logEntries) : [],
                apiArray.isCash,
                apiArray.dividendPeriodicity,
                0,
                apiArray.bankAccount ? BankAccountCreator.oneFromApiArray(apiArray.bankAccount) : undefined,
                apiArray.underlying ? PositionCreator.oneFromApiArray(apiArray.underlying) : undefined,
                undefined,
                apiArray.motherId,
                apiArray.sector ? SectorCreator.oneFromApiArray(apiArray.sector) : undefined,
                apiArray.strategy ? StrategyCreator.oneFromApiArray(apiArray.strategy) : undefined,
                CurrencyCreator.oneFromApiArray(apiArray.currency),
                apiArray.balance ? BalanceCreator.oneFromApiArray(apiArray.balance) : undefined,
                apiArray.shareheadId,
                apiArray.stopLoss ? apiArray.stopLoss : undefined,
                apiArray.targetPrice ? apiArray.targetPrice : undefined,
                apiArray.targetType ? apiArray.targetType : undefined,
                apiArray.manualDividend ? apiArray.manualDividend : undefined,
                apiArray.manualTargetPrice ? apiArray.manualTargetPrice : undefined,
                apiArray.manualDrawdown ? apiArray.manualDrawdown : undefined,
                apiArray.manualDividendDrop !== undefined && apiArray.manualDividendDrop !== null && !isNaN(apiArray.manualDividendDrop) ? apiArray.manualDividendDrop : undefined,
                apiArray.manualDividendExDate ? new Date(apiArray.manualDividendExDate) : undefined,
                apiArray.manualDividendPayDate ? new Date(apiArray.manualDividendPayDate) : undefined,
                apiArray.manualDividendAmount ? apiArray.manualDividendAmount : undefined,
                apiArray.manualAveragePerformance ? apiArray.manualAveragePerformance : undefined,
                apiArray.manualLastAverageRate ? apiArray.manualLastAverageRate : undefined,
                apiArray.labels ? LabelCreator.fromApiArray(apiArray.labels) : undefined,
                apiArray.bankAccountName ? apiArray?.bankAccountName : accountName? accountName : undefined,
                apiArray.markedLines ? JSON.parse(apiArray.markedLines.toString()) : []
            );
        } else {
            return undefined;
        }
    }

}
