import {AnalystRating} from "../models/analyst-rating";


export class AnalystRatingCreator {

    public static fromApiArray(apiArray: AnalystRating[]): AnalystRating[] {
        const array: AnalystRating[] = [];

        for (const entry of apiArray) {
            const share = this.oneFromApiArray(entry);
            if (share instanceof AnalystRating) {
                array.push(share);
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
            );
        } else {
            return null;
        }
    }

}
