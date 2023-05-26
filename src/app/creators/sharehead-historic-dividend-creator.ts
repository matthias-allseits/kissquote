import {ShareheadHistoricDividend} from "../models/sharehead-historic-dividend";
import {CurrencyCreator} from "./currency-creator";


export class ShareheadHistoricDividendCreator {

    public static createNewDividend(): ShareheadHistoricDividend {
        return new ShareheadHistoricDividend(0, 0, 0);
    }

    public static fromApiArray(apiArray: ShareheadHistoricDividend[]): ShareheadHistoricDividend[] {
        const array: ShareheadHistoricDividend[] = [];

        for (const dividdendList of apiArray) {
            const dividend = this.oneFromApiArray(dividdendList);
            if (null !== dividend) {
                array.push(dividend);
            }
        }
        array.sort((a, b) => (a.year > b.year) ? 1 : ((b.year > a.year) ? -1 : 0));

        return array;
    }


    public static oneFromApiArray(apiArray: ShareheadHistoricDividend): ShareheadHistoricDividend|null
    {
        if (apiArray !== undefined) {
            return new ShareheadHistoricDividend(
                apiArray.id,
                apiArray.year,
                apiArray.dividend,
                CurrencyCreator.oneFromApiArray(apiArray.currency),
            );
        } else {
            return null;
        }
    }

}
