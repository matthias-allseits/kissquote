import {Share} from "./share";

export class ManualDividend {

    constructor(
        public id: number,
        public share: Share|null,
        public year?: number,
        public amount?: number,
        public shareId?: number,
    ) {}

}
