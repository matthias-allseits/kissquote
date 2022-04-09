import {ShareheadShare} from "./sharehead-share";

export class WatchlistEntry {

    constructor(
        public shareheadId: number,
        public startDate: Date,
        public shareheadShare?: ShareheadShare,
    ) { }

}
