import {BankAccount} from './bank-account';
import {BankAccountCreator} from "../creators/bank-account-creator";
import {Share} from "./share";
import {Currency} from "./currency";
import {YearDividendsTotal} from "../sites/my-dashboard/my-dashboard.component";
import {ChartData} from "chart.js";
import {DividendTotal, Position} from "./position";


export interface DividendTotals {
    year: number;
    list: DividendTotal[];
    total: number;
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
        [2015, 2016, 2017, 2018, 2020, 2021, 2022, 2023, 2024, 2025].forEach(year => {
            const list: DividendTotal[] = [];
            let total = 0;
            this.getAllPositions().forEach(position => {
                const result = position.dividendTotalByYear(year);
                if (result.total > 0) {
                    list.push(result);
                    total += result.total;
                }
            });
            const fixedTotal = +total.toFixed(0);
            totals.push(
                {
                    year: year,
                    list: list,
                    total: fixedTotal,
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


    getAllShares(): Share[] {
        const shares: Share[] = [];
        this.bankAccounts.forEach(account => {
            account.positions.forEach(position => {
                if (position.share) {
                    shares.push(position.share);
                }
            });
        });

        return shares;
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
