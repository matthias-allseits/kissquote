import {Currency} from './currency';
import {Share} from './share';
import {Transaction} from "./transaction";
import {CurrencyCreator} from "../creators/currency-creator";

export class Position {

    constructor(
        public id: number,
        public share: Share|null,
        public currency: Currency|null,
        public active: boolean,
        public activeFrom: Date|null,
        public activeUntil: Date|null,
        public transactions: Transaction[],
    ) {}

}
