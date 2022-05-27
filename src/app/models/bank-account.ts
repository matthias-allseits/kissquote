import {DividendTotal, Position} from './position';
import {DividendTotals} from "./portfolio";


export class BankAccount {

    constructor(
        public id: number,
        public name: string,
        public positions: Position[],
    ) {}


    getActiveNonCashPositions(): Position[] {
        const positions: Position[] = [];
        this.positions.forEach(position => {
            if (!position.isCash && position.active) {
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


    getClosedNonCashPositions(): Position[] {
        const positions: Position[] = [];
        this.positions.forEach(position => {
            if (!position.isCash && !position.active) {
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
        this.getActiveNonCashPositions().forEach(position => {
            if (position.balance) {
                total += position.balance?.collectedDividends;
            }
        });

        return total;
    }


    investmentTotal(): number {
        let total = 0;
        this.getActiveNonCashPositions().forEach(position => {
            if (position.balance) {
                total += position.balance?.investment;
            }
        });

        return total;
    }


    valueTotal(): number {
        let total = 0;
        this.getActiveNonCashPositions().forEach(position => {
            const actualValue = position.actualValue();
            if (actualValue) {
                total += +actualValue;
            }
        });

        return total;
    }


    cashTotal(): number {
        let total = 0;
        this.getCashPositions().forEach(position => {
            const actualValue = position.actualValue();
            if (actualValue) {
                total += +actualValue;
            }
        });

        return total;
    }


    openPositionsBalance(): number {

        return this.valueTotal() - this.investmentTotal();
    }


    cashRatio(): number {

        return (100 / this.valueTotal() * this.cashTotal());
    }


    dividendProjectionsTotal(): number {
        let total = 0;
        const year = new Date().getFullYear();
        const dividendCollection = this.collectDividendForYear(year, year);
        total = dividendCollection.payedTotal + dividendCollection.plannedTotal;

        return total;
    }


    dividendProjectionsYield(): number {

        return (100 / this.investmentTotal() * this.dividendProjectionsTotal());
    }


    private collectDividendForYear(year: number, thisYear: number): DividendTotals {
        const payedList: DividendTotal[] = [];
        const plannedList: DividendTotal[] = [];
        let payedTotal = 0;
        let plannedTotal = 0;
        this.getActiveNonCashPositions().forEach(position => {
            const payedResult = position.payedDividendsTotalByYear(year);
            const plannedResult = position.plannedDividendsTotalByYear(year);
            if (payedResult.total > 0) {
                payedList.push(payedResult);
                payedTotal += payedResult.total;
                +(plannedResult.total -= payedResult.total).toFixed(0);
            }
            if (year >= thisYear && position.active && payedResult.transactionCount < position.maxDividendTransactionsByPeriodicy()) {
                plannedList.push(plannedResult);
                plannedTotal += plannedResult.total;
            }
        });
        const fixedPayedTotal = +payedTotal.toFixed(0);
        const fixedPlannedTotal = +plannedTotal.toFixed(0);

        return {
            year: year,
            payedList: payedList,
            plannedList: plannedList,
            payedTotal: fixedPayedTotal,
            plannedTotal: fixedPlannedTotal,
        }
    }

}
