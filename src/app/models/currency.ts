export class Currency {

    constructor(
        public id: number,
        public name: string,
        public rate: number,
    ) {}


    public static fromApiArray(apiArray: Currency[]): Currency[] {
        const array: Currency[] = [];

        for (const currencyList of apiArray) {
            const currency = this.oneFromApiArray(currencyList);
            if (null !== currency) {
                array.push(currency);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: Currency|null): Currency|null
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new Currency(
                apiArray.id,
                apiArray.name,
                apiArray.rate,
            );
        } else {
            return null;
        }
    }

}
