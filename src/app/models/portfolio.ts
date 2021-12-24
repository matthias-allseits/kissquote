import {Position} from './position';


export class Portfolio {

    constructor(
        public id: number,
        public userName: string,
        public hashKey: string,
        public startDate: Date,
        public positions: Position[],
    ) {}


    public static oneFromApiArray(apiArray: Portfolio): Portfolio
    {
        if (apiArray !== undefined) {
            return new Portfolio(
                apiArray.id,
                apiArray.userName,
                apiArray.hashKey,
                new Date(apiArray.startDate),
                apiArray.positions ? Position.fromApiArray(apiArray.positions) : [],
            );
        } else {
            return null;
        }
    }

}
