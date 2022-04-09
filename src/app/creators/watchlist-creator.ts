import {WatchlistEntry} from "../models/watchlistEntry";

export class WatchlistCreator {

    public static fromApiArray(apiArray: object): WatchlistEntry[] {
        const array: WatchlistEntry[] = [];

        if (Array.isArray(apiArray)) {
            for (const watchList of apiArray) {
                const entry = this.oneFromApiArray(watchList);
                if (entry instanceof WatchlistEntry) {
                    array.push(entry);
                }
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: WatchlistEntry|null): WatchlistEntry|null
    {
        if (apiArray !== undefined && apiArray !== null) {
            return new WatchlistEntry(
                apiArray.shareheadId,
                new Date(apiArray.startDate),
                apiArray.title,
            );
        } else {
            return null;
        }
    }

}
