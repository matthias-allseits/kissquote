import {Currency} from "./currency";


export class ShareheadShare {

    constructor(
        public id: number,
        public currency: Currency|null,
        public name: string|null,
        public shortname: string|null,
        public isin: string|null,
        public symbol?: string,
        public urlFinanznet?: string,
        public urlWikipedia?: string,
        public urlInvesting?: string,
        public urlFinanztreff?: string,
    ) { }

}
