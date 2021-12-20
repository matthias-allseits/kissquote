export class Portfolio {

    constructor(
        public id: number,
        public userName: string,
        public hashKey: string,
        public startDate: Date,
    ) {}


    public static oneFromApiArray(apiArray: Portfolio): Portfolio
    {
        if (apiArray !== undefined) {
            return new Portfolio(
                apiArray.id,
                apiArray.userName,
                apiArray.hashKey,
                new Date(apiArray.startDate),
            );
        } else {
            return null;
        }
    }

}
