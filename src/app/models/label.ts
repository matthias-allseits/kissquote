export class Label {

    constructor(
        public id: number,
        public name: string,
        public color: string,
        public checked?: boolean, // for filtering purposes
    ) {}

}
