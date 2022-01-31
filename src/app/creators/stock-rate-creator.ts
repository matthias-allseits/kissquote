import {StockRate} from "../models/stock-rate";

export class StockRateCreator {


    public static createNewStockRate(): StockRate {
        return new StockRate(0, null, 0, '');
    }

    public static oneFromApiArray(apiArray: StockRate): StockRate|undefined
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new StockRate(
                apiArray.id,
                apiArray.date ? new Date(apiArray.date) : null,
                apiArray.rate,
                apiArray.currency,
            );
        } else {
            return undefined;
        }
    }

}
