import {StockRate} from "../models/stock-rate";
import {StockRateCreator} from "../creators/stock-rate-creator";

export class SwissquoteHelper {

    public static parseRates(content: string, islandApesShit = false): StockRate[] {
        // 20220603 | 286.0 | 277.6 | 286.0 | 278.4   | 27525
        // Datum    | Hoch  | Tief  | Start | Schluss | Volumen
        const rates: StockRate[] = [];
        const lines = content.split("\n");
        let addedMonthsToShow = 276;
        let daysSinceStartLimit = 4000;
        // if (screen.width < 400) {
        //     addedMonthsToShow = 4;
        //     daysSinceStartLimit = 150
        // }
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
                // console.log(date);
                const rate = StockRateCreator.createNewStockRate();
                rate.date = date;
                if (!islandApesShit) {
                    rate.rate = +cells[4];
                    rate.open = +cells[3];
                    rate.high = +cells[1];
                    rate.low = +cells[2];
                } else {
                    rate.rate = +cells[4] / 100;
                    rate.open = +cells[3] / 100;
                    rate.high = +cells[1] / 100;
                    rate.low = +cells[2] / 100;
                }
                if (rate.low === 0) {
                    rate.low = rate.rate;
                }
                if (rate.high === 0) {
                    rate.high = rate.rate;
                }
                rates.push(rate);
            }
        });

        return rates;
    }

}
