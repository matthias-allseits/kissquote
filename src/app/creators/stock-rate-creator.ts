import {StockRate} from "../models/stock-rate";

export class StockRateCreator {


    public static createNewStockRate(): StockRate {
        return new StockRate(0, new Date(), 0, 0, 0, 0, '');
    }

    public static oneFromApiArray(apiArray: StockRate): StockRate|null
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new StockRate(
                apiArray.id,
                new Date(apiArray.date),
                apiArray.rate,
                apiArray.open,
                apiArray.high,
                apiArray.low,
                apiArray.currency,
            );
        } else {
            return null;
        }
    }

}
