import {Currency} from "../models/currency";


export class CurrencyCreator {

    public static createNewCurrency(): Currency {
        return new Currency(0, null, null);
    }


    public static fromApiArray(apiArray: Currency[]): Currency[] {
        const array: Currency[] = [];

        for (const currencyList of apiArray) {
            const currency = this.oneFromApiArray(currencyList);
            if (currency) {
                array.push(currency);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: Currency|undefined): Currency|undefined
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new Currency(
                apiArray.id,
                apiArray.name,
                apiArray.rate,
            );
        } else {
            return undefined;
        }
    }

}
