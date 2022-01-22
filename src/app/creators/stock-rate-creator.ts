import {StockRate} from "../models/stock-rate";

export class StockRateCreator {


    public static oneFromApiArray(apiArray: StockRate): StockRate|undefined
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new StockRate(
                apiArray.id,
                new Date(apiArray.date),
                apiArray.rate,
                apiArray.currency,
            );
        } else {
            return undefined;
        }
    }

}
