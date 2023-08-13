import {StockRate} from "../models/stock-rate";
import {StockRateCreator} from "../creators/stock-rate-creator";

export class SwissquoteHelper {

    // todo: activeFrom is obsolete!?
    public static parseRates(content: string, activeFrom: Date, daysSinceStart: number): StockRate[] {
        // 20220603 | 286.0 | 277.6 | 286.0 | 278.4   | 27525
        // Datum    | Hoch  | Tief  | Start | Schluss | Volumen
        const rates: StockRate[] = [];
        const lines = content.split("\n");
        let startDate = new Date(activeFrom);
        let addedMonthsToShow = 120;
        let daysSinceStartLimit = 4000;
        // if (screen.width < 400) {
        //     addedMonthsToShow = 4;
        //     daysSinceStartLimit = 150
        // }
        if (daysSinceStart < daysSinceStartLimit) {
            startDate.setMonth(startDate.getMonth() - addedMonthsToShow);
        }
        startDate.setHours(0);
        lines.forEach((line: any, index: number) => {
            line = line.replaceAll("'", '');
            line = line.replaceAll("\r", '');
            const cells = line.split('|');
            if (cells.length > 3) {
                const rawDate = cells[0];
                const year = +rawDate.substr(0, 4);
                const monthIndex = +rawDate.substr(4, 2) - 1;
                // console.log(rawDate);
                // console.log(rawDate.substr(4, 2));
                // console.log(monthIndex);
                const day = +rawDate.substr(6, 2);
                const date = new Date(year, monthIndex, day);
                if (date >= startDate) {
                    // console.log(date);
                    const rate = StockRateCreator.createNewStockRate();
                    rate.date = date;
                    rate.rate = +cells[4];
                    rate.open = +cells[3];
                    rate.high = +cells[1];
                    rate.low = +cells[2];
                    if (rate.low === 0) {
                        rate.low = rate.rate;
                    }
                    if (rate.high === 0) {
                        rate.high = rate.rate;
                    }
                    rates.push(rate);
                }
            }
        });

        return rates;
    }

}
