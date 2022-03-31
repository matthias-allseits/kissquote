import {BankAccount} from './bank-account';
import {BankAccountCreator} from "../creators/bank-account-creator";
import {Currency} from "./currency";
import {ChartData} from "chart.js";
import {DividendTotal, Position} from "./position";


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


    dividendProjectionsTotal(): number {
        let total = 0;
        this.bankAccounts.forEach(account => {
            account.getActiveNonCashPositions().forEach(position => {
                if (position.balance) {
                    total += position.balance?.projectedNextDividendPayment;
                }
            });
        });

        return total;
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


    collectDividendLists(): DividendTotals[] {
        const totals: DividendTotals[] = [];
        const thisYear = new Date().getFullYear();
        const startYear = thisYear - 7;
        const allYears = [];
        for(let x = 0; x <= 10; x++) {
            allYears.push(startYear + x);
        }
        allYears.forEach(year => {
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
                if (year >= thisYear) {
                    plannedList.push(plannedResult);
                    plannedTotal += plannedResult.total;
                }
            });
            const fixedPayedTotal = +payedTotal.toFixed(0);
            const fixedPlannedTotal = +plannedTotal.toFixed(0);
            totals.push(
                {
                    year: year,
                    payedList: payedList,
                    plannedList: plannedList,
                    payedTotal: fixedPayedTotal,
                    plannedTotal: fixedPlannedTotal,
                }
            );
        });

        return totals;
    }


    dividendIncomeChartData(): ChartData {
        const chartData: ChartData = {
            labels: [],
            datasets: [
                {
                    data: [],
                    borderColor: 'rgb(51, 102, 204, 1)',
                    backgroundColor: 'rgb(51, 102, 204, 1)',
                    hoverBackgroundColor: 'rgb(51, 102, 204, 0.5)'
                },
                {
                    data: [],
                    borderColor: 'rgba(51,102,204,0.5)',
                    backgroundColor: 'rgb(51, 102, 204, 0.5)',
                    hoverBackgroundColor: 'rgb(51, 102, 204, 0.2)'
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


    getEmptyBankAccount(): BankAccount|null {
        let hit = null;
        this.bankAccounts.forEach(account => {
            if (account.positions.length === 0) {
                hit = account;
            }
        });

        return hit;
    }

}
