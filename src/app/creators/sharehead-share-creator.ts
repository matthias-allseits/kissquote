import {ShareheadShare} from "../models/shareheadShare";
import {CurrencyCreator} from "./currency-creator";


export class ShareheadShareCreator {


    public static oneFromApiArray(apiArray: ShareheadShare|null): ShareheadShare|null
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new ShareheadShare(
                apiArray.id,
                CurrencyCreator.oneFromApiArray(apiArray.currency),
                apiArray.name,
                apiArray.shortname,
                apiArray.isin,
                apiArray.symbol,
                apiArray.urlFinanznet,
                apiArray.urlWikipedia,
                apiArray.urlInvesting,
                apiArray.urlFinanztreff,
            );
        } else {
            return null;
        }
    }

}
