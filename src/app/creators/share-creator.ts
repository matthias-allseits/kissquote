import {Share} from "../models/share";
import {MarketplaceCreator} from "./marketplace-creator";
import {ManualDividendCreator} from "./manual-dividend-creator";


export class ShareCreator {

    public static createNewShare(): Share {
        return new Share(0, null, null, null, null);
    }


    public static fromApiArray(apiArray: Share[]): Share[] {
        const array: Share[] = [];

        for (const shareList of apiArray) {
            const share = this.oneFromApiArray(shareList);
            if (share instanceof Share) {
                array.push(share);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: Share|null): Share|null
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new Share(
                +apiArray.id,
                apiArray.name,
                apiArray.shortname,
                apiArray.isin,
                apiArray.type,
                apiArray.marketplace ? MarketplaceCreator.oneFromApiArray(apiArray.marketplace) : undefined,
                apiArray.shareheadId ? +apiArray.shareheadId : undefined,
                apiArray.manualDividends ? ManualDividendCreator.fromApiArray(apiArray.manualDividends) : undefined
            );
        } else {
            return null;
        }
    }

}
