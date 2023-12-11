import {PositionLog} from "../models/position-log";


export class PositionLogCreator {

    public static createNewPositionLog(): PositionLog {
        return new PositionLog(0, new Date(), '', '', false);
    }


    public static fromApiArray(apiArray: PositionLog[]): PositionLog[] {
        const array: PositionLog[] = [];

        for (const entryList of apiArray) {
            const entry = this.oneFromApiArray(entryList);
            if (entry) {
                array.push(entry);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: PositionLog|undefined): PositionLog|undefined
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new PositionLog(
                apiArray.id,
                new Date(apiArray.date),
                apiArray.log,
                apiArray.emoticon,
                apiArray.pinned,
                apiArray.positionId
            );
        } else {
            return undefined;
        }
    }

}
