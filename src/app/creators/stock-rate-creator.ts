import {StockRate} from "../models/stock-rate";

export class StockRateCreator {


    public static createNewStockRate(): StockRate {
        return new StockRate(0, new Date(), 0, 0, 0, 0, '');
    }

    public static oneFromApiArray(apiArray: StockRate): StockRate|undefined
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new StockRate(
                apiArray.id,
                new Date(apiArray.date),
                apiArray.rate,
                apiArray.open,
                apiArray.high > 0 ? apiArray.high : apiArray.rate,
                apiArray.low > 0 ? apiArray.low : apiArray.rate,
                apiArray.currency,
            );
        } else {
            return undefined;
        }
    }

}
