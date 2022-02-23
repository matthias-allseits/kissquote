import {ShareheadShare} from "../models/sharehead-share";
import {CurrencyCreator} from "./currency-creator";
import {ShareheadBalanceCreator} from "./sharehead-balance-creator";


export class ShareheadShareCreator {

    public static fromApiArray(apiArray: ShareheadShare[]): ShareheadShare[] {
        const array: ShareheadShare[] = [];

        for (const shareList of apiArray) {
            const share = this.oneFromApiArray(shareList);
            if (share instanceof ShareheadShare) {
                array.push(share);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: ShareheadShare|null): ShareheadShare|null
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new ShareheadShare(
                apiArray.id,
                apiArray.shareheadId,
                CurrencyCreator.oneFromApiArray(apiArray.currency),
                apiArray.name,
                apiArray.shortname,
                apiArray.isin,
                apiArray.symbol,
                apiArray.country,
                apiArray.sector,
                apiArray.financialYearEndDate ? new Date(apiArray.financialYearEndDate) : null,
                apiArray.urlFinanznet,
                apiArray.urlWikipedia,
                apiArray.urlInvesting,
                apiArray.urlFinanztreff,
                apiArray.balances ? ShareheadBalanceCreator.fromApiArray(apiArray.balances) : [],
                apiArray.estimations ? ShareheadBalanceCreator.fromApiArray(apiArray.estimations) : [],
            );
        } else {
            return null;
        }
    }

}