export class Currency {

    constructor(
        public id: number,
        public name: string,
        public rate: number,
    ) {}


    public static oneFromApiArray(apiArray: Currency): Currency
    {
        if (apiArray !== undefined) {
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
