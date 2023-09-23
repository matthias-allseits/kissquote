import {ShareheadShare} from "./sharehead-share";

export class WatchlistEntry {

    constructor(
        public shareheadId: number,
        public startDate: Date,
        public title: string,
        public shareheadShare?: ShareheadShare,
    ) { }

}
