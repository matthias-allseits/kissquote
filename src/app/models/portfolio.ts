import {BankAccount} from './bank-account';
import {BankAccountCreator} from "../creators/bank-account-creator";
import {Currency} from "./currency";
import {ChartData} from "chart.js";
import {DividendDropSummary, DividendTotal, MaxDrawdownSummary, Position} from "./position";
import {WatchlistEntry} from "./watchlistEntry";
import {DateHelper} from "../core/datehelper";
import {Sector} from "./sector";
import {Forexhelper} from "../core/forexhelper";


export interface DividendTotals {
    year: number;
    payedList: DividendTotal[];
    plannedList: DividendTotal[];
    payedTotal: number;
    plannedTotal: number;
}

export interface LombardValuesSummary {
    position: Position;
    maxDrawdownSummary: MaxDrawdownSummary;
}

export interface CrisisDividendSummary {
    position: Position;
    crisisDropSummary: DividendDropSummary;
}

export interface DiversitySummary {
    sector: Sector;
    investment: number;
    value: number;
    dividends: number;
    percentage: number;
    color: string;
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


    calculatePositionsShareFromTotal(): void {
        const valueTotal = this.valueTotal();
        this.bankAccounts.forEach(account => {
            account.positions.forEach(position => {
                position.shareFromTotal = 100 / valueTotal * +position.actualValue();
            });
        });
    }


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


    positionById(id: number): Position|null {
        let hit = null;
        this.getAllPositions().forEach(position => {
            if (position.id === id) {
                hit = position;
            }
        });

        return hit;
    }


    investmentTotal(): number {
        let total = 0;
        this.bankAccounts.forEach(account => {
            total += account.investmentTotal();
        });

        return total;
    }


    valueTotal(): number {
        let total = 0;
        this.bankAccounts.forEach(account => {
            total += account.valueTotal();
        });

        return total;
    }


    cashTotal(): number {
        let total = 0;
        this.bankAccounts.forEach(account => {
            total += account.cashTotal();
        });

        return total;
    }


    cashRatio(): number {

        return (100 / this.valueTotal() * this.cashTotal());
    }


    thisYearsDividendsTotal(): number {
        let total = 0;
        const year = new Date().getFullYear();
        const dividendCollection = this.collectDividendForYear(year, year);
        total = dividendCollection.payedTotal + dividendCollection.plannedTotal;

        return total;
    }


    thisYearsDividendsYield(): number {

        return (100 / this.investmentTotal() * this.thisYearsDividendsTotal());
    }


    dividendProjectionsTotal(): number {
        let total = 0;
        this.bankAccounts.forEach(account => {
            total += account.dividendProjectionsTotal();
        });

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


    getActiveNonCashPositions(): Position[] {
        let positions: Position[] = [];
        this.bankAccounts.forEach(account => {
            positions = positions.concat(account.getActiveNonCashPositions());
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
        // positions = positions.reverse();
        positions.sort((a,b) => (a.activeUntil && b.activeUntil && a.activeUntil < b.activeUntil) ? 1 : ((a.activeUntil && b.activeUntil && b.activeUntil < a.activeUntil) ? -1 : 0));

        return positions;
    }


    lombardValuePositions(): LombardValuesSummary[] {
        const positions: LombardValuesSummary[] = [];
        const relevantPositions = this.getActiveNonCashPositions();
        relevantPositions.forEach(position => {
            const summary = position.getMaxDrawdownSummary();
            if (summary) {
                positions.push({
                    position: position,
                    maxDrawdownSummary: summary,
                });
            }
        });
        positions.sort((a,b) => (a.maxDrawdownSummary.lombardValue < b.maxDrawdownSummary.lombardValue) ? 1 : ((b.maxDrawdownSummary.lombardValue < a.maxDrawdownSummary.lombardValue) ? -1 : 0));

        return positions;
    }


    crisisDividendProjections(): CrisisDividendSummary[] {
        const positions: CrisisDividendSummary[] = [];
        const relevantPositions = this.getActiveNonCashPositions();
        relevantPositions.forEach(position => {
            const summary = position.getDividendDropSummary();
            if (summary) {
                positions.push({
                    position: position,
                    crisisDropSummary: summary,
                });
            }
        });
        positions.sort((a,b) => (a.crisisDropSummary.dividendAfterDrop < b.crisisDropSummary.dividendAfterDrop) ? 1 : ((b.crisisDropSummary.dividendAfterDrop < a.crisisDropSummary.dividendAfterDrop) ? -1 : 0));

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
                },
                {
                    label: 'projected',
                    data: [],
                    borderColor: 'rgb(255, 102, 51, 1)',
                    backgroundColor: 'rgb(255, 102, 51, 1)',
                    hoverBackgroundColor: 'rgb(255, 102, 51, 0.5)',
                    pointBackgroundColor: 'rgb(220, 57, 18, 1)',
                    pointHoverBackgroundColor: 'rgba(220, 57, 18, 1)',
                    pointHoverBorderColor: 'rgba(220, 57, 18, 1)',
                }
            ]
        };

        const thisYear = new Date().getFullYear();
        this.collectDividendLists()?.forEach(list => {
            const date = new Date(list.year, 6, 1);
            const relevantPositions = this.getPositionsAtDate(date);
            let investment = 0;
            relevantPositions.forEach(position => {
                investment += position.investmentAtDate(date);
            });
            investment = +investment.toFixed(0);
            chartData.labels?.push(list.year);
            if (list.year < thisYear) {
                chartData.datasets[0].data.push(investment);
                chartData.datasets[1].data.push(NaN);
            } else if (list.year == thisYear) {
                chartData.datasets[0].data.push(investment);
                chartData.datasets[1].data.push(investment);
            } else {
                chartData.datasets[0].data.push(NaN);
                chartData.datasets[1].data.push(investment);
            }
        });

        return chartData;
    }


    yieldChartData(): ChartData {
        const chartData: ChartData = {
            labels: [],
            datasets: [
                {
                    label: 'yield',
                    data: [],
                    borderColor: 'rgb(51, 102, 204, 1)',
                    backgroundColor: 'rgb(51, 102, 204, 1)',
                    hoverBackgroundColor: 'rgb(51, 102, 204, 0.5)',
                    pointBackgroundColor: 'rgba(51, 102, 204, 1)',
                    pointHoverBackgroundColor: 'rgba(51, 102, 204, 1)',
                    pointHoverBorderColor: 'rgba(51, 102, 204, 1)',
                },
                {
                    label: 'projected',
                    data: [],
                    borderColor: 'rgb(255, 102, 51, 1)',
                    backgroundColor: 'rgb(255, 102, 51, 1)',
                    hoverBackgroundColor: 'rgb(255, 102, 51, 0.5)',
                    pointBackgroundColor: 'rgb(220, 57, 18, 1)',
                    pointHoverBackgroundColor: 'rgba(220, 57, 18, 1)',
                    pointHoverBorderColor: 'rgba(220, 57, 18, 1)',
                }
            ]
        };

        const thisYear = new Date().getFullYear();
        this.collectDividendLists()?.forEach(list => {
            const date = new Date(list.year, 6, 1);
            const relevantPositions = this.getPositionsAtDate(date);
            let investment = 0;
            relevantPositions.forEach(position => {
                investment += position.investmentAtDate(date);
            });
            investment = +investment.toFixed(0);
            chartData.labels?.push(list.year);
            const result = +(100 / investment * (+list.payedTotal.toFixed(0) + +list.plannedTotal.toFixed(0))).toFixed(1);
            if (list.year < thisYear) {
                chartData.datasets[0].data.push(result);
                chartData.datasets[1].data.push(NaN);
            } else if (list.year == thisYear) {
                chartData.datasets[0].data.push(result);
                chartData.datasets[1].data.push(result);
            } else {
                chartData.datasets[0].data.push(NaN);
                chartData.datasets[1].data.push(result);
            }
        });

        return chartData;
    }


    diversityByInvestmentChartData(): ChartData {
        const summaries = this.diversitySummary();

        let total = 0;
        summaries.forEach(summary => {
            total += summary.investment;
        });
        summaries.forEach(summary => {
            summary.percentage = +(100 / total * summary.investment).toFixed(1);
        });

        summaries.sort((a,b) => (a.investment < b.investment) ? 1 : ((b.investment < a.investment) ? -1 : 0))
        const data: number[] = [];
        const colors: string[] = [];
        const labels: string[] = [];
        summaries.forEach(summary => {
            data.push(summary.investment);
            colors.push(summary.color);
            labels.push(`${summary.sector.name} ${summary.percentage}%`);
        });
        const chartData: ChartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Sector',
                    data: data,
                    backgroundColor: colors,
                }
            ]
        };

        return chartData;
    }


    diversityByValueChartData(): ChartData {
        const summaries = this.diversitySummary();

        let total = 0;
        summaries.forEach(summary => {
            total += summary.value;
        });
        summaries.forEach(summary => {
            summary.percentage = +(100 / total * summary.value).toFixed(1);
        });

        summaries.sort((a,b) => (a.value < b.value) ? 1 : ((b.value < a.value) ? -1 : 0))
        const data: number[] = [];
        const colors: string[] = [];
        const labels: string[] = [];
        summaries.forEach(summary => {
            data.push(summary.value);
            colors.push(summary.color);
            labels.push(`${summary.sector.name} ${summary.percentage}%`);
        });
        const chartData: ChartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Sector',
                    data: data,
                    backgroundColor: colors,
                }
            ]
        };

        return chartData;
    }


    diversityByDividendChartData(): ChartData {
        const summaries = this.diversitySummary();

        let total = 0;
        summaries.forEach(summary => {
            total += summary.dividends;
        });
        summaries.forEach(summary => {
            summary.percentage = +(100 / total * summary.dividends).toFixed(1);
        });

        summaries.sort((a,b) => (a.dividends < b.dividends) ? 1 : ((b.dividends < a.dividends) ? -1 : 0))
        const data: number[] = [];
        const colors: string[] = [];
        const labels: string[] = [];
        summaries.forEach(summary => {
            data.push(+summary.dividends.toFixed(0));
            colors.push(summary.color);
            labels.push(`${summary.sector.name} ${summary.percentage}%`);
        });
        const chartData: ChartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Sector',
                    data: data,
                    backgroundColor: colors,
                }
            ]
        };

        return chartData;
    }


    incomeChartDataImproved(): ChartData {
        const chartData: ChartData = {
            labels: [],
            datasets: [
                {
                    label: (new Date().getFullYear() - 2).toString(),
                    data: [],
                    borderColor: 'rgb(220, 193, 18, 1)',
                    backgroundColor: 'rgb(220, 193, 18, 1)',
                    hoverBackgroundColor: 'rgb(220, 193, 18, 0.5)',
                    pointBackgroundColor: 'rgb(220, 193, 18, 1)',
                    pointHoverBackgroundColor: 'rgba(220, 193, 18, 1)',
                    pointHoverBorderColor: 'rgba(220, 193, 18, 1)',
                    yAxisID: 'y',
                },
                {
                    label: (new Date().getFullYear() - 1).toString(),
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
                    label: (new Date().getFullYear()).toString(),
                    data: [],
                    borderColor: 'rgb(112, 204, 51)',
                    backgroundColor: 'rgb(112, 204, 51, 1)',
                    hoverBackgroundColor: 'rgb(112, 204, 51, 0.5)',
                    pointBackgroundColor: 'rgba(112, 204, 51, 1)',
                    pointHoverBackgroundColor: 'rgba(112, 204, 51, 1)',
                    pointHoverBorderColor: 'rgba(112, 204, 51, 1)',
                    yAxisID: 'y',
                },
                {
                    label: (new Date().getFullYear() + 1).toString(),
                    data: [],
                    borderColor: 'rgb(255, 102, 51, 1)',
                    backgroundColor: 'rgb(255, 102, 51, 1)',
                    hoverBackgroundColor: 'rgb(255, 102, 51, 0.5)',
                    pointBackgroundColor: 'rgb(220, 57, 18, 1)',
                    pointHoverBackgroundColor: 'rgba(220, 57, 18, 1)',
                    pointHoverBorderColor: 'rgba(220, 57, 18, 1)',
                    yAxisID: 'y',
                }
            ]
        };

        const months: Date[] = [];
        for(let x = 0; x < 12; x++) {
            const today = new Date();
            const month = new Date(today.getFullYear(), x, 1);
            months.push(month);
        }

        months.forEach(month => {
            const monthThisYear = month;
            const monthLastYear = new Date(month.getFullYear() - 1, month.getMonth(), 1);
            const monthtwoYearsBefore = new Date(month.getFullYear() - 2, month.getMonth(), 1);
            const monththreeYearsBefore = new Date(month.getFullYear() - 3, month.getMonth(), 1);
            let incomeThisYear = 0;
            let incomeLastYear = 0;
            let incomeTwoYearsBefore = 0;
            let incomeThreeYearsBefore = 0;
            this.getAllPositions().forEach(position => {
                position.transactions.forEach(transaction => {
                    if (transaction.isDividend() && transaction.date instanceof Date && transaction.rate) {
                        const workDate = transaction.date;
                        workDate.setDate(1);
                        if (DateHelper.datesAreEqual(monthThisYear, workDate)) {
                            incomeThisYear += transaction.rate;
                        } else if (DateHelper.datesAreEqual(monthLastYear, workDate)) {
                            incomeLastYear += transaction.rate;
                        } else if (DateHelper.datesAreEqual(monthtwoYearsBefore, workDate)) {
                            incomeTwoYearsBefore += transaction.rate;
                        } else if (DateHelper.datesAreEqual(monththreeYearsBefore, workDate)) {
                            incomeThreeYearsBefore += transaction.rate;
                        }
                    }
                });
            });
            chartData.labels?.push(DateHelper.monthFromDateObject(month));
            chartData.datasets[0].data.push(Math.round(incomeThreeYearsBefore));
            chartData.datasets[1].data.push(Math.round(incomeTwoYearsBefore));
            chartData.datasets[2].data.push(Math.round(incomeLastYear));
            chartData.datasets[3].data.push(Math.round(incomeThisYear));
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
            collection.payedList.sort((a,b) => (a.total < b.total) ? 1 : ((b.total < a.total) ? -1 : 0));
            collection.plannedList.sort((a,b) => (a.total < b.total) ? 1 : ((b.total < a.total) ? -1 : 0));
            totals.push(collection);
        });

        return totals;
    }


    allShareheadIdsFromPositions(): number[] {
        const ids: number[] = [];
        this.getActiveNonCashPositions().forEach(position => {
            if (position.shareheadId) {
                ids.push(position.shareheadId);
            }
        });
        this.watchlistEntries.forEach(entry => {
            ids.push(entry.shareheadId);
        });

        return ids;
    }


    private diversitySummary(): DiversitySummary[] {
        const colors = ['rgb(255, 99, 132, 1)', 'rgb(54, 162, 235, 1)', 'rgb(255, 206, 86, 1)', 'rgb(75, 192, 192, 1)', 'rgb(153, 102, 255, 1)', 'rgb(255, 159, 64, 1)', 'rgb(99, 255, 234, 1)', 'rgb(200, 255, 99, 1)', 'rgb(210, 105, 30, 1)', 'rgb(220, 20, 60, 1)', 'rgb(255, 99, 71, 1)', 'rgb(255, 215, 0, 1)', 'rgb(139, 0, 139, 1)', 'rgb(106, 90, 205, 1)', 'rgb(160, 82, 45, 1)', 'rgb(218, 165, 32, 1)', 'rgb(152, 251, 152, 1)', 'rgb(143, 188, 143, 1)'];

        const summaries: DiversitySummary[] = [];
        const positions = this.getActiveNonCashPositions();
        let index = 0;
        positions.forEach(position => {
            if (position.sector && position.balance && position.balance.lastRate) {
                const summary = this.getSummaryBySector(summaries, position.sector);
                let dividend = +position.shareheadDividendPayment();
                if (position.shareheadShare?.currency) {
                    const usersCurrency = Forexhelper.getUsersCurrencyByName(position.shareheadShare?.currency?.name);
                    if (usersCurrency) {
                        dividend = usersCurrency.rate * dividend;
                        if (position.currency && position.currency?.name !== 'CHF') {
                            dividend = dividend / position.currency?.rate;
                        }
                    }
                }
                if (summary) {
                    summary.investment += position.balance?.investment;
                    summary.value += +position.actualValue();
                    summary.dividends += dividend;
                } else {
                    const summary = {
                        sector: position.sector,
                        investment: position.balance?.investment,
                        value: +position.actualValue(),
                        dividends: dividend,
                        percentage: 0,
                        color: colors[index]
                    };
                    index++;
                    summaries.push(summary);
                }
            }
        });

        return summaries;
    }


    private getSummaryBySector(summaries: DiversitySummary[], sector: Sector): DiversitySummary|null {
        let result = null;
        summaries.forEach(summary => {
            if (summary.sector.id === sector.id) {
                result = summary;
            }
        });

        return result;
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
            if (plannedResult.manualDividend) {
                plannedList.push(plannedResult);
                plannedTotal += plannedResult.total;
            } else if (year >= thisYear && position.active && payedResult.transactionCount < position.maxDividendTransactionsByPeriodicy()) {
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
