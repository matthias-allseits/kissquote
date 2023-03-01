import {ShareheadTurningPoint} from "../models/sharehead-turning-point";


export class ShareheadTurningPointCreator {

    public static fromApiArray(apiArray: ShareheadTurningPoint[]): ShareheadTurningPoint[] {
        const array: ShareheadTurningPoint[] = [];

        for (const pointList of apiArray) {
            const turningPoint = this.oneFromApiArray(pointList);
            if (null !== turningPoint) {
                array.push(turningPoint);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: ShareheadTurningPoint): ShareheadTurningPoint|null
    {
        if (apiArray !== undefined) {
            return new ShareheadTurningPoint(
                apiArray.id,
                new Date(apiArray.date),
                +apiArray.rate,
                apiArray.type,
            );
        } else {
            return null;
        }
    }

}
