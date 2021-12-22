export class Share {

    constructor(
        public id: number,
        public name: string,
        public shortname: string,
        public isin: string,
        public type: string,
    ) {}


    public static oneFromApiArray(apiArray: Share): Share
    {
        if (apiArray !== undefined) {
            return new Share(
                apiArray.id,
                apiArray.name,
                apiArray.shortname,
                apiArray.isin,
                apiArray.type,
            );
        } else {
            return null;
        }
    }

}
