import {Marketplace} from "./marketplace";
import {ManualDividend} from "./manual-dividend";


export class Share {

    constructor(
        public id: number,
        public name: string|null,
        public shortname: string|null,
        public isin: string|null,
        public type: string|null,
        public marketplace?: Marketplace,
        public shareheadId?: number,
        public manualDividends?: ManualDividend[],
    ) { }


    public manualDividendByYear(year: number): ManualDividend|undefined {
        let hit = undefined;
        this.manualDividends?.forEach(dividend => {
            if (dividend.year === year) {
                hit = dividend;
            }
        });

        return hit;
    }

}
