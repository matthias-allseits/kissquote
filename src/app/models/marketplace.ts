export class Marketplace {

    constructor(
        public id: number,
        public name: string|null,
        public place: string|null,
        public currency: string|null,
        public urlKey: number|null,
        public isinKey: string|null,
    ) {}


    getName(): string
    {
        return this.name + ' ' + this.place;
    }

}
