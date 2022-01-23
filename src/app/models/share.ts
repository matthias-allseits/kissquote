import {Marketplace} from "./marketplace";


export class Share {

    constructor(
        public id: number,
        public name: string|null,
        public shortname: string|null,
        public isin: string|null,
        public type: string|null,
        public marketplace?: Marketplace,
    ) { }

}
