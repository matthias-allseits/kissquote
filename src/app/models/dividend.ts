import {Share} from "./share";

export class Dividend {

    constructor(
        public id: number,
        public share: Share|null,
        public date: Date|null,
        public valueNet: number|null,
        public valueGross: number|null,
    ) {}

}
