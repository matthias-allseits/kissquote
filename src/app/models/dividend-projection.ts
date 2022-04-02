
export class DividendProjection {

    constructor(
        public year: Date|null,
        public projectionValue: number,
        public projectionCurrency: string,
        public projectionSource: string,
        public yieldFloat: string,
        public currencyCorrectedProjectionValue?: number,
        public currencyCorrectedProjectionCurrency?: string
    ) {}

}
