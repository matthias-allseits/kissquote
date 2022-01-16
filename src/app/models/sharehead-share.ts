import {Currency} from "./currency";
import {ShareheadBalance} from "./sharehead-balance";


export class ShareheadShare {

    constructor(
        public id: number,
        public currency: Currency|null,
        public name: string|null,
        public shortname: string|null,
        public isin: string|null,
        public symbol?: string,
        public country?: string,
        public urlFinanznet?: string,
        public urlWikipedia?: string,
        public urlInvesting?: string,
        public urlFinanztreff?: string,
        public balances?: ShareheadBalance[],
    ) { }

}
