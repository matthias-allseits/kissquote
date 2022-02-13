import {Currency} from "./currency";
import {ShareheadBalance} from "./sharehead-balance";
import {ShareheadEstimation} from "./sharehead-estimation";


export class ShareheadShare {

    constructor(
        public id: number,
        public currency: Currency|null,
        public name: string|null,
        public shortname: string|null,
        public isin: string|null,
        public symbol?: string,
        public country?: string,
        public sector?: string,
        public financialYearEndDate?: Date|null,
        public urlFinanznet?: string,
        public urlWikipedia?: string,
        public urlInvesting?: string,
        public urlFinanztreff?: string,
        public balances?: ShareheadBalance[],
        public estimations?: ShareheadEstimation[],
    ) { }


    dividendProjectionForYear(year: Date): number
    {
        const estimation = this.lastEstimationForYear(year);
        if (estimation) {
            return estimation.dividend;
        }

        return 0;
    }


    lastEstimationForYear(year: Date): ShareheadEstimation|null
    {
        let hit = null;
        if (this.estimations) {
            this.estimations.forEach(estimation => {
                if (estimation.year === year.getFullYear()) {
                    hit = estimation;
                }
            });
        }

        return hit;
    }

}
