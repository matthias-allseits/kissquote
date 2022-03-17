import {BankAccount} from './bank-account';
import {BankAccountCreator} from "../creators/bank-account-creator";
import {Currency} from "./currency";
import {YearDividendsTotal} from "../sites/my-dashboard/my-dashboard.component";
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
            account.getNonCashPositions().forEach(position => {
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
            account.getNonCashPositions().forEach(position => {
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
            account.getNonCashPositions().forEach(position => {
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
            positions = positions.concat(account.getNonCashPositions());
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


    yearDividendTotals(): YearDividendsTotal[] {
        const totals: YearDividendsTotal[] = [];
        this.bankAccounts.forEach(account => {
            account.getNonCashPositions().forEach(position => {
                position.transactions.forEach(transaction => {
                    if (transaction.isDividend() && transaction.date instanceof Date && transaction.rate) {
                        const year = transaction.date.getFullYear();
                        let added = false;
                        totals.forEach(entry => {
                            if (entry.year === year) {
                                entry.total += transaction.rate ? transaction.rate : 0;
                                added = true;
                            }
                        });
                        if (!added) {
                            totals.push(
                                {
                                    year: year,
                                    total: transaction.rate
                                }
                            );
                        }
                    }
                });
            });
        });
        totals.sort((a, b) => (a.year > b.year) ? 1 : ((b.year > a.year) ? -1 : 0));

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
                }
            ]
        };

        this.yearDividendTotals()?.forEach(dividendTotal => {
            chartData.labels?.push(dividendTotal.year);
            chartData.datasets[0].data.push(+dividendTotal.total.toFixed(0));
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
