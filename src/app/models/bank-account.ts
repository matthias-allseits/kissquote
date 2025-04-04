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


    getRealActiveNonCashPositions(): Position[] {
        const positions: Position[] = [];
        this.positions.forEach(position => {
            if (!position.isCash && position.active && position.balance && position.balance?.amount > 0) {
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
            if (position.balance && position.balance.amount > 0) {
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


    thisYearsDividendsTotal(): number {
        let total = 0;
        const year = new Date().getFullYear();
        const dividendCollection = this.collectDividendsForYear(year, year);
        total = dividendCollection.payedTotal + dividendCollection.plannedTotal;

        return total;
    }


    thisYearsDividendsYield(): number {

        return (100 / this.investmentTotal() * this.thisYearsDividendsTotal());
    }


    dividendProjectionsTotal(): number {
        const year = new Date().getFullYear();
        const total = this.collectProjectedDividendsForYear(year, year);

        return total;
    }


    dividendProjectionsYield(): number {

        return (100 / this.investmentTotal() * this.dividendProjectionsTotal());
    }


    private collectDividendsForYear(year: number, thisYear: number): DividendTotals {
        const payedList: DividendTotal[] = [];
        const plannedList: DividendTotal[] = [];
        let payedTotal = 0;
        let payedTotalNet = 0;
        let plannedTotal = 0;
        this.getActiveNonCashPositions().forEach(position => {
            const payedResult = position.payedDividendsTotalByYear(year);
            const plannedResult = position.plannedDividendsTotalByYear(year);
            if (payedResult.total > 0) {
                payedList.push(payedResult);
                payedTotal += payedResult.total;
                payedTotalNet += payedResult.totalNet;
                +(plannedResult.total -= payedResult.total).toFixed(0);
            }
            if (year >= thisYear && position.active && payedResult.transactionCount < position.maxDividendTransactionsByPeriodicy()) {
                plannedList.push(plannedResult);
                plannedTotal += plannedResult.total;
            }
        });
        const fixedPayedTotal = +payedTotal.toFixed(0);
        const fixedPayedTotalNet = +payedTotalNet.toFixed(0);
        const fixedPlannedTotal = +plannedTotal.toFixed(0);

        return {
            year: year,
            payedList: payedList,
            plannedList: plannedList,
            payedTotal: fixedPayedTotal,
            payedTotalNet: fixedPayedTotalNet,
            plannedTotal: fixedPlannedTotal,
        }
    }


    private collectProjectedDividendsForYear(year: number, thisYear: number): number {
        let total = 0;
        this.getActiveNonCashPositions().forEach(position => {
            if (position.balance) {
                total += +position.shareheadDividendPaymentCorrected();
            }
        });

        return total;
    }

}
