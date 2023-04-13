import {AnalystRating} from "../models/analyst-rating";
import {ShareheadShareCreator} from "./sharehead-share-creator";


export class AnalystRatingCreator {

    public static fromApiArray(apiArray: object): AnalystRating[] {
        const array: AnalystRating[] = [];

        if (Array.isArray(apiArray)) {
            for (const entry of apiArray) {
                const share = this.oneFromApiArray(entry);
                if (share instanceof AnalystRating) {
                    array.push(share);
                }
            }
        }
        array.reverse();

        return array;
    }


    public static oneFromApiArray(apiArray: AnalystRating|null): AnalystRating|null
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new AnalystRating(
                +apiArray.id,
                apiArray.analyst.shortName,
                apiArray.currency?.name,
                new Date(apiArray.date),
                apiArray.priceTarget,
                apiArray.rating,
                apiArray.share ? ShareheadShareCreator.oneFromApiArray(apiArray.share) : undefined,
            );
        } else {
            return null;
        }
    }

}
