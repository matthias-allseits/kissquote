import {Position} from './position';


export class BankAccount {

    constructor(
        public id: number,
        public name: string,
        public positions: Position[],
    ) {}


    getNonCashPositions(): Position[] {
        const positions: Position[] = [];
        this.positions.forEach(position => {
            if (!position.isCash) {
                positions.push(position);
            }
        });

        return positions;
    }


    getCashPositions(): Position[] {
        const positions: Position[] = [];
        this.positions.forEach(position => {
            if (position.isCash) {
                positions.push(position);
            }
        });

        return positions;
    }


    getAccountFeesTotal(): number {
        let total = 0;
        this.getCashPositions().forEach(position => {
            position.transactions.forEach(transaction => {
                if (transaction.title === 'Depotgebühren') {
                    if (transaction.rate) {
                        total += transaction.rate;
                    }
                }
            });
        });

        return total;
    }


    getEarningsTotal(): number {
        let total = 0;
        this.getNonCashPositions().forEach(position => {
            if (position.balance) {
                total += position.balance?.collectedDividends;
            }
        });

        return total;
    }

}
