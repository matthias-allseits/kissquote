import {ShareheadBalance} from "../models/sharehead-balance";
import {CurrencyCreator} from "./currency-creator";


export class ShareheadBalanceCreator {

    public static fromApiArray(apiArray: ShareheadBalance[]): ShareheadBalance[] {
        const array: ShareheadBalance[] = [];

        for (const balanceList of apiArray) {
            const balance = this.oneFromApiArray(balanceList);
            if (balance instanceof ShareheadBalance) {
                array.push(balance);
            }
        }
        array.sort((a,b) => (a.year > b.year) ? 1 : ((b.year > a.year) ? -1 : 0))

        return array;
    }


    public static oneFromApiArray(apiArray: ShareheadBalance|null): ShareheadBalance|null
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new ShareheadBalance(
                new Date(apiArray.date),
                apiArray.year,
                apiArray.sales,
                apiArray.profitPerShare,
                apiArray.profit,
                apiArray.equityRatio,
                apiArray.dividend,
                apiArray.avgRate,
                CurrencyCreator.oneFromApiArray(apiArray.currency),
                apiArray.debtNet,
                apiArray.ordinarySharesNumber,
                apiArray.treasurySharesNumber,
            );
        } else {
            return null;
        }
    }

}
