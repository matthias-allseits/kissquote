import {Currency} from './currency';

export class Position {

    constructor(
        public id: number,
        public currency: Currency,
        public active: boolean,
    ) {}


    public static fromApiArray(apiArray: Position[]): Position[] {
        const array: Position[] = [];

        for (const PositionList of apiArray) {
            const position = this.oneFromApiArray(PositionList);
            array.push(position);
        }

        return array;
    }


    public static oneFromApiArray(apiArray: Position): Position
    {
        if (apiArray !== undefined) {
            return new Position(
                apiArray.id,
                Currency.oneFromApiArray(apiArray.currency),
                apiArray.active,
            );
        } else {
            return null;
        }
    }

}
