import {BankAccount} from './bank-account';
import {BankAccountCreator} from "../creators/bank-account-creator";
import {Currency} from "./currency";
import {ChartData} from "chart.js";
import {DividendTotal, Position} from "./position";
import {WatchlistEntry} from "./watchlistEntry";


export interface DividendTotals {
    year: number;
    payedList: DividendTotal[];
    plannedList: DividendTotal[];
    payedTotal: number;
    plannedTotal: number;
}

export class Portfolio {

    constructor(
        public id: number,
        public userName: string|null,
        public hashKey: string|null,
        public startDate: Date|null,
        public bankAccounts: BankAccount[],
        public currencies: Currency[],
        public watchlistEntries: WatchlistEntry[],
    ) {}


    getBankAccountsWithoutPositions(): BankAccount[] {
        const copy: BankAccount[] = [];
        this.bankAccounts.forEach(account => {
            const cp = BankAccountCreator.createNewBankAccount();
            cp.id = account.id;
            cp.name = account.name;
            copy.push(cp);
        });

        return copy;
    }


    investmentTotal(): number {
        let total = 0;
        this.bankAccounts.forEach(account => {
            account.getActiveNonCashPositions().forEach(position => {
                if (position.balance) {
                    total += position.balance?.investment;
                }
            });
        });

        return total;
    }


    valueTotal(): number {
        let total = 0;
        this.bankAccounts.forEach(account => {
            account.getActiveNonCashPositions().forEach(position => {
                const actualValue = position.actualValue();
                if (actualValue) {
                    total += +actualValue;
                }
            });
        });

        return total;
    }


    cashTotal(): number {
        let total = 0;
        this.bankAccounts.forEach(account => {
            account.getCashPositions().forEach(position => {
                const actualValue = position.actualValue();
                if (actualValue) {
                    total += +actualValue;
                }
            });
        });

        return total;
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


    openPositionsBalance(): number {

        return this.valueTotal() - this.investmentTotal();
    }


    getAllPositions(): Position[] {
        let positions: Position[] = [];
        this.bankAccounts.forEach(account => {
            positions = positions.concat(account.getActiveNonCashPositions());
            positions = positions.concat(account.getClosedNonCashPositions());
        });

        return positions;
    }


    getClosedNonCashPositions(): Position[] {
        let positions: Position[] = [];
        this.bankAccounts.forEach(account => {
            const accountsPositions = account.getClosedNonCashPositions();
            accountsPositions.forEach(position => {
                position.bankAccount = account;
            });
            positions = positions.concat(accountsPositions);
        });

        return positions;
    }


    dividendIncomeChartData(): ChartData {
        const chartData: ChartData = {
            labels: [],
            datasets: [
                {
                    label: 'payed',
                    data: [],
                    borderColor: 'rgb(51, 102, 204, 1)',
                    backgroundColor: 'rgb(51, 102, 204, 1)',
                    hoverBackgroundColor: 'rgb(51, 102, 204, 0.5)'
                },
                {
                    label: 'projected',
                    data: [],
                    borderColor: 'rgb(255, 102, 51, 1)',
                    backgroundColor: 'rgb(255, 102, 51, 1)',
                    hoverBackgroundColor: 'rgb(255, 102, 51, 0.5)'
                }
            ]
        };

        this.collectDividendLists()?.forEach(list => {
            chartData.labels?.push(list.year);
            chartData.datasets[0].data.push(+list.payedTotal.toFixed(0));
            chartData.datasets[1].data.push(+list.plannedTotal.toFixed(0));
        });

        return chartData;
    }


    investmentChartData(): ChartData {
        const chartData: ChartData = {
            labels: [],
            datasets: [
                {
                    label: 'investment',
                    data: [],
                    borderColor: 'rgb(51, 102, 204, 1)',
                    backgroundColor: 'rgb(51, 102, 204, 1)',
                    hoverBackgroundColor: 'rgb(51, 102, 204, 0.5)',
                    pointBackgroundColor: 'rgba(51, 102, 204, 1)',
                    pointHoverBackgroundColor: 'rgba(51, 102, 204, 1)',
                    pointHoverBorderColor: 'rgba(51, 102, 204, 1)',
                    yAxisID: 'y',
                },
                {
                    label: 'yield',
                    data: [],
                    borderColor: 'rgb(255, 102, 51, 1)',
                    backgroundColor: 'rgb(255, 102, 51, 1)',
                    hoverBackgroundColor: 'rgb(255, 102, 51, 0.5)',
                    pointBackgroundColor: 'rgb(220, 57, 18, 1)',
                    pointHoverBackgroundColor: 'rgba(220, 57, 18, 1)',
                    pointHoverBorderColor: 'rgba(220, 57, 18, 1)',
                    yAxisID: 'y1',
                }
            ]
        };

        this.collectDividendLists()?.forEach(list => {
            const date = new Date(list.year, 6, 1);
            const relevantPositions = this.getPositionsAtDate(date);
            let investment = 0;
            relevantPositions.forEach(position => {
                investment += position.investmentAtDate(date);
            });
            investment = +investment.toFixed(0);
            chartData.labels?.push(list.year);
            chartData.datasets[0].data.push(investment);
            chartData.datasets[1].data.push(+(100 / investment * (+list.payedTotal.toFixed(0) + +list.plannedTotal.toFixed(0))).toFixed(1));
        });

        return chartData;
    }


    getEmptyBankAccount(): BankAccount|null {
        let hit = null;
        this.bankAccounts.forEach(account => {
            if (account.positions.length === 0) {
                hit = account;
            }
        });

        return hit;
    }


    collectDividendLists(): DividendTotals[] {
        const totals: DividendTotals[] = [];
        const thisYear = new Date().getFullYear();
        const startYear = thisYear - 7;
        const allYears = [];
        for(let x = 0; x <= 10; x++) {
            allYears.push(startYear + x);
        }
        allYears.forEach(year => {
            const collection = this.collectDividendForYear(year, thisYear);
            totals.push(collection);
        });

        return totals;
    }


    private collectDividendForYear(year: number, thisYear: number): DividendTotals {
        const payedList: DividendTotal[] = [];
        const plannedList: DividendTotal[] = [];
        let payedTotal = 0;
        let plannedTotal = 0;
        this.getAllPositions().forEach(position => {
            const payedResult = position.payedDividendsTotalByYear(year);
            const plannedResult = position.plannedDividendsTotalByYear(year);
            if (payedResult.total > 0) {
                payedList.push(payedResult);
                payedTotal += payedResult.total;
                +(plannedResult.total -= payedResult.total).toFixed(0);
            }
            if (year >= thisYear && position.active) {
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


    private getPositionsAtDate(date: Date): Position[]
    {
        const positions: Position[] = [];
        this.getAllPositions().forEach(position => {
            if (
                position.activeFrom <= date &&
                (position.activeUntil === null || position.activeUntil >= date)
            ) {
                positions.push(position);
            }
        });

        return positions;
    }

}
