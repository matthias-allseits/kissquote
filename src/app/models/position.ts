import {Currency} from './currency';
import {Share} from './share';

export class Position {

    constructor(
        public id: number,
        public share: Share|null,
        public currency: Currency|null,
        public active: boolean,
        public activeFrom: Date|null,
        public activeUntil: Date|null,
    ) {}


    public static createNewPosition(): Position {
        return new Position(0, null, null, true, null, null);
    }

    public static fromApiArray(apiArray: Position[]): Position[] {
        const array: Position[] = [];

        for (const PositionList of apiArray) {
            const position = this.oneFromApiArray(PositionList);
            if (null !== position) {
                array.push(position);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: Position): Position|null
    {
        if (apiArray !== undefined) {
            return new Position(
                apiArray.id,
                Share.oneFromApiArray(apiArray.share),
                Currency.oneFromApiArray(apiArray.currency),
                apiArray.active,
                apiArray.activeFrom,
                apiArray.activeUntil,
            );
        } else {
            return null;
        }
    }

}
