
export class DividendProjection {

    constructor(
        public year: Date|null,
        public projection: string,
        public yieldFloat: string,
        public currencyCorrectedProjection?: string
    ) {}

}
