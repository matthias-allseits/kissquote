import {Balance} from "../models/balance";
import {StockRateCreator} from "./stock-rate-creator";


export class BalanceCreator {

    public static oneFromApiArray(apiArray: Balance): Balance|undefined
    {
        if (apiArray !== undefined) {
            return new Balance(
                apiArray.amount,
                apiArray.firstRate,
                apiArray.averagePayedPriceGross,
                apiArray.averagePayedPriceNet,
                apiArray.breakEvenPrice,
                apiArray.investment,
                apiArray.transactionFeesTotal,
                apiArray.collectedDividends,
                apiArray.collectedDividendsCurrency,
                apiArray.projectedNextDividendPayment,
                apiArray.projectedNextDividendCurrency,
                apiArray.collectedInterest,
                apiArray.collectedCoupons,
                apiArray.performance,
                apiArray.lastRate ? StockRateCreator.oneFromApiArray(apiArray.lastRate) : undefined,
                apiArray.cashValue,
                apiArray.closedResult,
            );
        } else {
            return undefined;
        }
    }

}
