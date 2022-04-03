import {Currency} from "../models/currency";


export class Forexhelper {

    public static getUsersCurrencyByName(name: string): Currency|undefined {
        let hit = undefined;
        const cachedCurrencies = localStorage.getItem('currencies');
        if (cachedCurrencies) {
            const currencies: Currency[] = JSON.parse(cachedCurrencies);
            currencies.forEach(currency => {
                if (currency.name == name) {
                    hit = currency;
                }
            });
        }

        return hit;
    }

}
