import {Position} from './position';


export class BankAccount {

    constructor(
        public id: number,
        public name: string,
        public positions: Position[],
    ) {}


    getNonCashPositions(): Position[]
    {
        const positions: Position[] = [];
        this.positions.forEach(position => {
            if (!position.isCash) {
                positions.push(position);
            }
        });

        return positions;
    }


    getCashPositions(): Position[]
    {
        const positions: Position[] = [];
        this.positions.forEach(position => {
            if (position.isCash) {
                positions.push(position);
            }
        });

        return positions;
    }

}
