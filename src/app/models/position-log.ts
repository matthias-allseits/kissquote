
export class PositionLog {

    constructor(
        public id: number,
        public date: Date|string,
        public log: string,
        public emoticon: string,
        public positionId?: number,
        public assetName?: string,
    ) {}

}
