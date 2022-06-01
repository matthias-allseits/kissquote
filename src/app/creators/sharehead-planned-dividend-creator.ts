import {ShareheadPlannedDividend} from "../models/sharehead-planned-dividend";
import {CurrencyCreator} from "./currency-creator";


export class ShareheadPlannedDividendCreator {

    public static fromApiArray(apiArray: ShareheadPlannedDividend[]): ShareheadPlannedDividend[] {
        const array: ShareheadPlannedDividend[] = [];

        for (const dividendList of apiArray) {
            const dividend = this.oneFromApiArray(dividendList);
            if (null !== dividend) {
                array.push(dividend);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: ShareheadPlannedDividend): ShareheadPlannedDividend|null
    {
        if (apiArray !== undefined) {
            const currency = CurrencyCreator.oneFromApiArray(apiArray.currency);
            return new ShareheadPlannedDividend(
                apiArray.id,
                new Date(apiArray.exDate),
                new Date(apiArray.payDate),
                +apiArray.amount,
                currency,
            );
        } else {
            return null;
        }
    }

}
