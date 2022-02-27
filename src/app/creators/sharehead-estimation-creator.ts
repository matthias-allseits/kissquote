import {CurrencyCreator} from "./currency-creator";
import {ShareheadEstimation} from "../models/sharehead-estimation";


export class ShareheadEstimationCreator {

    public static fromApiArray(apiArray: ShareheadEstimation[]): ShareheadEstimation[] {
        const array: ShareheadEstimation[] = [];

        for (const balanceList of apiArray) {
            const balance = this.oneFromApiArray(balanceList);
            if (balance instanceof ShareheadEstimation) {
                array.push(balance);
            }
        }
        array.sort((a,b) => (a.year > b.year) ? 1 : ((b.year > a.year) ? -1 : 0))

        return array;
    }


    public static oneFromApiArray(apiArray: ShareheadEstimation|null): ShareheadEstimation|null
    {
        if (apiArray !== undefined && apiArray !== null) {
            const currency = CurrencyCreator.oneFromApiArray(apiArray.currency);
            return new ShareheadEstimation(
                new Date(apiArray.date),
                apiArray.year,
                apiArray.sales,
                apiArray.profitPerShare,
                apiArray.profit,
                apiArray.equityRatio,
                apiArray.dividend,
                apiArray.avgRate,
                currency,
            );
        } else {
            return null;
        }
    }

}
