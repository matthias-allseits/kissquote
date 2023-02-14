import {Currency} from './currency';
import {Share} from './share';
import {Transaction} from "./transaction";
import {BankAccount} from "./bank-account";
import {Balance} from "./balance";
import {ChartData} from "chart.js";
import {StockRate} from "./stock-rate";
import {StockRateCreator} from "../creators/stock-rate-creator";
import {DateHelper} from "../core/datehelper";
import {Observable} from "rxjs";
import {ShareheadShare} from "./sharehead-share";
import {DividendProjection} from "./dividend-projection";
import {DividendProjectionCreator} from "../creators/dividend-projection-creator";
import {Forexhelper} from "../core/forexhelper";
import {ManualDividend} from "./manual-dividend";


export interface DividendTotal {
    positionId: number;
    name: string;
    total: number;
    currency: Currency|null;
    source: string;
    transactionCount: number;
    manualDividend?: ManualDividend;
}

export class Position {

    constructor(
        public id: number,
        public share: Share|null,
        public active: boolean,
        public activeFrom: Date|string,
        public activeUntil: Date|null|string,
        public transactions: Transaction[],
        public isCash: boolean = false,
        public dividendPeriodicity: string,
        public bankAccount?: BankAccount,
        public currency?: Currency,
        public balance?: Balance,
        public shareheadId?: number,
        public shareheadShare?: ShareheadShare,
    ) {}


    public getName(): string {
        if (this.share && this.share.name) {
            return this.share.name;
        } else if (this.currency && this.currency.name) {
            return this.currency.name;
        } else {
            return 'undefined';
        }
    }


    investmentBalance(): string
    {
        let result = 0;
        const actualValue = this.actualValue();
        if (this.balance && actualValue) {
            result = ((100 / this.balance.investment * +actualValue) - 100);
        }

        return result.toFixed(1);
    }


    investmentAtDate(date: Date): number
    {
        let value = 0;
        this.transactions.forEach(transaction => {
            if (transaction.rate && transaction.date <= date) {
                if (transaction.title === 'Kauf') {
                    let transResult = (transaction.quantity * transaction.rate);
                    if (transaction.fee) {
                        transResult += transaction.fee;
                    }
                    value += transResult;
                } else if (transaction.title === 'Verkauf') {
                    let transResult = (transaction.quantity * transaction.rate);
                    if (transaction.fee) {
                        transResult -= transaction.fee;
                    }
                    value -= transResult;
                }
            }
        });

        return value;
    }


    payedDividendsTotalByYear(year: number): DividendTotal
    {
        let total = 0;
        let transactionCount = 0;
        let currency = null;
        let lastTransactionDate: Date;

        this.transactions.forEach(transaction => {
            if (transaction.isDividend() && transaction.date instanceof Date && transaction.date.getFullYear() === year && transaction.rate) {
                total += transaction.rate;
                currency = transaction.currency;
                if (lastTransactionDate === undefined || transaction.date.getTime() !== lastTransactionDate.getTime()) {
                    transactionCount++;
                }
                lastTransactionDate = transaction.date;
            }
        });
        total = +total.toFixed(0);

        const manualDividend = this.share?.manualDividendByYear(year);

        const result = {
            positionId: this.id,
            name: this.getName(),
            total: total,
            currency: currency,
            source: '',
            transactionCount: transactionCount,
            manualDividend: manualDividend,
        };

        return result;
    }


    plannedDividendsTotalByYear(year: number): DividendTotal
    {
        let total = 0;
        let currency = null;
        let source = 'From last payment(s)';

        if (this.balance && this.currency) {
            total = this.balance.projectedNextDividendPayment;
            currency = this.currency;
        }
        // todo: implement another method, that delivers the correct payment for this year considering the amount-changing-transactions
        const shareheadSharePayment = this.shareheadDividendPaymentCorrected();
        let projectedDividend = null;
        let lastProjectedDividend = null;
        if (year > new Date().getFullYear()) {
            const yearObject = new Date(new Date().setFullYear(year));
            projectedDividend = this.generateProjection(yearObject);
            if (projectedDividend === null) {
                const yearObject = new Date(new Date().setFullYear(year - 1));
                lastProjectedDividend = this.generateProjection(yearObject);
            }
        }

        const manualDividend = this.share?.manualDividendByYear(year);

        if (manualDividend && manualDividend.amount !== undefined) {
            source = 'From manual dividend entry';
            total = +manualDividend.amount;
        } else if (projectedDividend) {
            total = 0;
            if (projectedDividend.currencyCorrectedProjectionValue !== undefined) {
                source = 'From stathead estimations (currency-corrected)';
                total += projectedDividend.currencyCorrectedProjectionValue;
            } else {
                source = 'From stathead estimations';
                total += projectedDividend.projectionValue;
            }
        } else if (lastProjectedDividend && lastProjectedDividend.projectionValue > 0) {
            total = 0;
            if (lastProjectedDividend.currencyCorrectedProjectionValue !== undefined) {
                source = 'From estimations ' + (year - 1) + ' (currency-corrected)';
                total += lastProjectedDividend.currencyCorrectedProjectionValue;
            } else {
                source = 'From estimations ' + (year - 1);
                total += lastProjectedDividend.projectionValue;
            }
        } else if (+shareheadSharePayment > 0) {
            total = +shareheadSharePayment;
            source = 'From stathead';
        }

        const result = {
            positionId: this.id,
            name: this.getName(),
            total: total,
            currency: currency,
            source: source,
            transactionCount: 0,
            manualDividend: manualDividend
        };

        return result;
    }


    isDividendRelevant(): boolean {
        let result = false;
        this.transactions.forEach(transaction => {
            if (transaction.isDividend()) {
                result = true;
            }
        });

        return result;
    }


    yieldOnInvestent(): string
    {
        let result = 0;
        if (this.balance) {
            result = (100 / this.balance.investment * this.balance.projectedNextDividendPayment);
        }

        return result.toFixed(1);
    }


    daysSinceStart(): number
    {
        let currentDate = new Date();

        if (this.activeFrom instanceof Date) {
            // yes i know, not every day has 24 hours. i do not care...
            return Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(this.activeFrom.getFullYear(), this.activeFrom.getMonth(), this.activeFrom.getDate()) ) /(1000 * 60 * 60 * 24));
        }

        return 1;
    }


    profitPerDay(): string
    {
        if (this.balance && this.balance.lastRate) {
            return ((((this.balance.amount * this.balance.lastRate.rate) - this.balance.investment) + this.balance?.collectedDividends) / this.daysSinceStart()).toFixed(1);
        }

        return 'n.v.';
    }


    public quantityTotal(): number {
        let quantity = 0;
        let ignoreNext = false;
        this.transactions.forEach((transaction, i) => {
            if (!ignoreNext) {
                if (transaction.title === 'Kauf' || transaction.title === 'Verkauf') {
                    quantity += transaction.quantity;
                } else if (transaction.title === 'Split') {
                    const splitRatio = transaction.quantity / this.transactions[i + 1].quantity;
                    quantity *= splitRatio;
                    ignoreNext = true;
                }
            } else {
                ignoreNext = false;
            }
        });

        return quantity;
    }


    public cashValuation(): number {
        let value = 0;
        this.transactions.forEach(transaction => {
            if (transaction.rate) {
                value += transaction.quantity * transaction.rate;
            }
        });

        return value;
    }


    public actualValue(): string {
        if (!this.isCash) {
            if (this.balance && this.balance.lastRate) {
                return (this.balance.amount * this.balance.lastRate.rate).toFixed(0)
            }
        } else {
            if (this.balance && this.balance.cashValue !== undefined) {
                return this.balance?.cashValue.toFixed(2);
            }
        }

        return '';
    }


    public urlSwissquote(): string|null {
        if (this.share && this.currency) {
            let currencyName = this.currency.name;
            if (currencyName === 'GBP') {
                currencyName = 'GBX';
            }
            return `https://www.swissquote.ch/sq_mi/market/Detail.action?s=${this.share.isin}_${this.share.marketplace?.urlKey}_${currencyName}`;
        }

        return null;
    }


    public dividendProjections(): any {
        const results = [];

        if (this.shareheadShare) {
            const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
            const nextYearP1 = new Date(new Date().setFullYear(new Date().getFullYear() + 2));
            const nextYearP2 = new Date(new Date().setFullYear(new Date().getFullYear() + 3));

            let projection = this.generateProjection(nextYear);
            if (projection) {
                results.push(projection);
            }
            projection = this.generateProjection(nextYearP1);
            if (projection) {
                results.push(projection);
            }
            projection = this.generateProjection(nextYearP2);
            if (projection) {
                results.push(projection);
            }
            const extrapolationDelta = 5;
            projection = this.extrapolateProjection(extrapolationDelta);
            if (projection) {
                results.push(projection);
            }
        }

        return results;
    }


    public shareheadDividendPayment(): string {
        let result = '';
        if (this.shareheadShare && this.balance) {
            const lastBalance = this.shareheadShare.lastBalance();
            if (lastBalance) {
                result = (lastBalance?.dividend * this.balance.amount).toFixed(0);
            }
        }

        return result;
    }


    public shareheadDividendPaymentCorrected(): string {
        let result = '';
        if (this.shareheadShare && this.balance) {
            const lastBalance = this.shareheadShare.lastBalance();
            let relevantAmount = this.balance.amount;
            // todo: implement a method, that checks dividend-transactions and amount-changing-transactions for correcting the result
            if (lastBalance) {
                if (this.currency?.name == this.shareheadShare.currency?.name) {
                    result = (lastBalance?.dividend * relevantAmount).toFixed(0);
                } else if (lastBalance.currency) {
                    result = (lastBalance.dividend * lastBalance.currency.rate * relevantAmount).toFixed(0);
                    if (this.currency && this.currency?.name !== 'CHF') {
                        result = (+result / this.currency.rate).toFixed(0);
                    }
                }
            }
        }

        return result;
    }


    public closedResultCorrected(): string {
        let result = '';
        if (this.balance && this.balance.closedResult) {
            result = this.balance.closedResult.toFixed(0);
            if (this.currency && this.currency?.name !== 'CHF') {
                result = (this.balance.closedResult * this.currency.rate).toFixed(0);
            }
        }

        return result;
    }


    public getRatesChartData(): Observable<ChartData> {
        return new Observable(obsData => {
            const historicRates: number[] = [];
            const historicLabels: string[] = [];
            if (this.share && this.currency) {
                let currencyName = this.currency.name;
                if (currencyName === 'GBP') {
                    currencyName = 'GBX';
                }
                let request = new XMLHttpRequest();
                const ratesUrl = `https://www.swissquote.ch/sqi_ws/HistoFromServlet?format=pipe&key=${this.share.isin}_${this.share.marketplace?.urlKey}_${currencyName}&ftype=day&fvalue=1&ptype=a&pvalue=1`;
                request.open("GET", ratesUrl, false);
                request.send(null);
                let content = request.responseText;
                // console.log(content);
                const rates = this.parseRates(content);

                rates.forEach(rate => {
                    if (rate.date) {
                        historicRates.push(rate.rate);
                        historicLabels.push(DateHelper.convertDateToGerman(rate.date));
                    }
                });
            }

            const data = {
                datasets: [
                    {
                        data: historicRates,
                        label: 'Kurs seit Start der Position',
                        backgroundColor: 'rgba(255,102,51,0)',
                        borderColor: '#ff6633',
                        pointBackgroundColor: '#c9461a',
                        pointBorderColor: '#ff6633',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#ff6633',
                        fill: 'origin',
                    }
                ],
                labels: historicLabels
            };

            obsData.next(data);
        });
    }


    public getStockRates(): Observable<StockRate[]> {
        return new Observable(obsData => {
            if (this.share && this.currency) {
                let currencyName = this.currency.name;
                if (currencyName === 'GBP') {
                    currencyName = 'GBX';
                }
                let request = new XMLHttpRequest();
                const ratesUrl = `https://www.swissquote.ch/sqi_ws/HistoFromServlet?format=pipe&key=${this.share.isin}_${this.share.marketplace?.urlKey}_${currencyName}&ftype=day&fvalue=1&ptype=a&pvalue=1`;
                request.open("GET", ratesUrl, false);
                request.send(null);
                let content = request.responseText;
                // console.log(content);
                const rates = this.parseRates(content);

                obsData.next(rates);
            }
        });
    }


    public maxDividendTransactionsByPeriodicy(): number {
        switch(this.dividendPeriodicity) {
            case 'quaterly':
                return 4;
            case 'half-yearly':
                return 2;
            default:
                return 1;
        }
    }


    private extrapolateProjection(extrapolationDelta: number): DividendProjection|null
    {
        let projection = null;

        const lastYield = this.extrapolateYield(extrapolationDelta);

        const extraYear = new Date(new Date().setFullYear(new Date().getFullYear() + extrapolationDelta));

        if (this.balance && this.shareheadShare && this.balance?.lastRate && lastYield > 0) {
            projection = DividendProjectionCreator.createNewDividendProjection();
            projection.year = extraYear;
            let projectedValue = (lastYield * this.balance.averagePayedPriceGross * this.balance?.amount) / 100;
            projection.projectionValue = projectedValue;
            projection.projectionCurrency = '' + this.currency?.name;
            projection.projectionSource = '(by xtrapolation with ' + this.shareheadShare.getAvgDividendRaise() + '%)';
            projection.yieldFloat = (100 / this.balance.investment * projectedValue).toFixed(1).toString() + '%';
        }

        return projection;
    }


    private extrapolateYield(extrapolationDelta: number): number
    {
        let extraYield = 0;
        if (this.shareheadShare && this.balance?.lastRate) {
            const lastBalance = this.shareheadShare.lastBalance();
            if (lastBalance) {
                // extraYield = +(100 / this.balance.investment * lastBalance?.dividend).toFixed(1)
                extraYield = +(100 / this.balance.averagePayedPriceGross * lastBalance?.dividend).toFixed(1);
                console.log('extraYield: ' + extraYield);
                const avgDividendRaise = +this.shareheadShare.getAvgDividendRaise();
                for (let x = 0; x < extrapolationDelta; x++) {
                    extraYield *= ((avgDividendRaise / 100) + 1);
                    console.log('extraYield: ' + extraYield);
                }
            }
        }

        return extraYield;
    }


    private parseRates(content: any): StockRate[] {
        // 20220603 | 286.0 | 277.6 | 286.0 | 278.4   | 27525
        // Datum    | Hoch  | Tief  | Start | Schluss | Volumen
        const rates: StockRate[] = [];
        const lines = content.split("\n");
        let startDate = new Date(this.activeFrom);
        if (this.daysSinceStart() < 150) {
            startDate.setMonth(startDate.getMonth() - 4);
        }
        startDate.setHours(0);
        lines.forEach((line: any, index: number) => {
            line = line.replaceAll("'", '');
            line = line.replaceAll("\r", '');
            const cells = line.split('|');
            if (cells.length > 3) {
                const rawDate = cells[0];
                const year = +rawDate.substr(0, 4);
                const monthIndex = +rawDate.substr(4, 2) - 1;
                // console.log(rawDate);
                // console.log(rawDate.substr(4, 2));
                // console.log(monthIndex);
                const day = +rawDate.substr(6, 2);
                const date = new Date(year, monthIndex, day);
                if (date >= startDate) {
                    // console.log(date);
                    const rate = StockRateCreator.createNewStockRate();
                    rate.date = date;
                    rate.rate = +cells[4];
                    rate.open = +cells[3];
                    rate.high = +cells[1];
                    rate.low = +cells[2];
                    rates.push(rate);
                }
            }
        });

        return rates;
    }


    private generateProjection(nextYear: Date): DividendProjection|null {
        if (this.shareheadShare) {
            const nextYearEstimation = this.shareheadShare.lastEstimationForYear(nextYear);

            if (nextYearEstimation) {
                const projection = DividendProjectionCreator.createNewDividendProjection();
                projection.year = nextYear;
                if (this.balance && this.currency?.rate) {
                    let projectedValue = nextYearEstimation.dividend * this.balance?.amount;
                    projection.projectionValue = projectedValue;
                    projection.projectionCurrency = '' + nextYearEstimation.currency?.name;
                    projection.projectionSource = '(by analysts estimations)';
                    if (nextYearEstimation.currency && nextYearEstimation.currency.rate && this.currency?.name !== nextYearEstimation.currency?.name) {
                        const usersCurrency = Forexhelper.getUsersCurrencyByName(nextYearEstimation.currency?.name);
                        if (usersCurrency) {
                            projectedValue = nextYearEstimation.dividend * usersCurrency.rate * this.balance?.amount;
                            if (this.currency?.name !== 'CHF') {
                                projectedValue = projectedValue / this.currency.rate;
                            }
                        }
                        projection.currencyCorrectedProjectionValue = projectedValue;
                        projection.currencyCorrectedProjectionCurrency = this.currency?.name;
                    }
                    projection.yieldFloat = (100 / this.balance.investment * projectedValue).toFixed(1).toString() + '%';
                }

                return projection;
            }
        }

        return null;
    }

}
