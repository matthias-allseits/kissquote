import {Analyst} from "../models/analyst";


export class AnalystCreator {

    public static createNewAnalyst(): Analyst {
        return new Analyst(0, '', '');
    }


    public static fromApiArray(apiArray: Analyst[]): Analyst[] {
        const array: Analyst[] = [];

        for (const currencyList of apiArray) {
            const currency = this.oneFromApiArray(currencyList);
            if (currency) {
                array.push(currency);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: Analyst|undefined): Analyst|undefined
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new Analyst(
                apiArray.id,
                apiArray.name,
                apiArray.shortName,
            );
        } else {
            return undefined;
        }
    }

}
