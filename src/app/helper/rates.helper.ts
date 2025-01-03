import {StockRate} from "../models/stock-rate";
import {Currency} from "../models/currency";

export class RatesHelper {

    public static calculateThisYearsAverageRate(historicRates: StockRate[], positionsCurrency: Currency): number|undefined {
        const thisYearsRates: StockRate[] = [];
        let ratesTotal = 0;
        let averageRate;
        const now = new Date();
        historicRates.forEach(rate => {
            if (rate.date.getFullYear() == now.getFullYear()) {
                thisYearsRates.push(rate);
                ratesTotal += rate.rate;
            }
        });
        if (thisYearsRates.length > 9) {
            averageRate = ratesTotal / thisYearsRates.length;
            if (positionsCurrency.name === 'GBP') {
                averageRate /= 100;
            }
        }

        return averageRate;
    }

}
