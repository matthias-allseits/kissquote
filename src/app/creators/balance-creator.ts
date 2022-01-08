import {Balance} from "../models/balance";


export class BalanceCreator {

    public static oneFromApiArray(apiArray: Balance): Balance|undefined
    {
        if (apiArray !== undefined) {
            return new Balance(
                apiArray.amount,
                apiArray.firstRate,
                apiArray.averagePayedPriceGross,
                apiArray.averagePayedPriceNet,
                apiArray.investment,
                apiArray.transactionFeesTotal,
            );
        } else {
            return undefined;
        }
    }

}
