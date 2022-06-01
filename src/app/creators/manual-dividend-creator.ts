import {ShareCreator} from "./share-creator";
import {ManualDividend} from "../models/manual-dividend";


export class ManualDividendCreator {

    public static createNewManualDividend(): ManualDividend {
        return new ManualDividend(0, null, undefined, undefined);
    }

    public static fromApiArray(apiArray: object): ManualDividend[] {
        const array: ManualDividend[] = [];

        if (Array.isArray(apiArray)) {
            for (const DividendList of apiArray) {
                const dividend = this.oneFromApiArray(DividendList);
                if (null !== dividend) {
                    array.push(dividend);
                }
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: ManualDividend): ManualDividend|null
    {
        if (apiArray !== undefined) {
            return new ManualDividend(
                apiArray.id,
                ShareCreator.oneFromApiArray(apiArray.share),
                apiArray.year,
                apiArray.amount,
            );
        } else {
            return null;
        }
    }

}
