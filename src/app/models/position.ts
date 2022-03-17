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


export interface DividendTotal {
    positionId: number;
    name: string;
    total: number;
    currency: Currency|null;
}

export class Position {

    constructor(
        public id: number,
        public share: Share|null,
        public active: boolean,
        public activeFrom: Date|string,
        public activeUntil: Date|null,
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


    payedDividendsTotalByYear(year: number): DividendTotal
    {
        let total = 0;
        let currency = null;

        this.transactions.forEach(transaction => {
            if (transaction.isDividend() && transaction.date instanceof Date && transaction.date.getFullYear() === year && transaction.rate) {
                total += transaction.rate;
                currency = transaction.currency;
            }
        });
        total = +total.toFixed(1);
        const result = {
            positionId: this.id,
            name: this.getName(),
            total: total,
            currency: currency
        };

        return result;
    }


    plannedDividendsTotalByYear(year: number): DividendTotal
    {
        let total = 0;
        let currency = null;

        if (this.balance && this.currency) {
            total = this.balance.projectedNextDividendPayment;
            currency = this.currency;
        }
        const result = {
            positionId: this.id,
            name: this.getName(),
            total: total,
            currency: currency
        };

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
            if (this.balance && this.balance.cashValue) {
                return this.balance?.cashValue.toString();
            }
        }

        return '';
    }


    public urlSwissquote(): string|null {
        if (this.share) {
            return `https://www.swissquote.ch/sq_mi/market/Detail.action?s=${this.share.isin}_${this.share.marketplace?.urlKey}_${this.currency?.name}`;
        }

        return null;
    }


    public getRatesChartData(): Observable<ChartData> {
        return new Observable(obsData => {
            const historicRates: number[] = [];
            const historicLabels: string[] = [];
            if (this.share) {
                let request = new XMLHttpRequest();
                const ratesUrl = `https://www.swissquote.ch/sqi_ws/HistoFromServlet?format=pipe&key=${this.share.isin}_${this.share.marketplace?.urlKey}_${this.currency?.name}&ftype=day&fvalue=1&ptype=a&pvalue=1`;
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


    private parseRates(content: any): StockRate[] {
        const rates: StockRate[] = [];
        const lines = content.split("\n");
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
                const tempDate = new Date(this.activeFrom);
                if (date >= tempDate) {
                    // console.log(date);
                    const rate = StockRateCreator.createNewStockRate();
                    rate.date = date;
                    rate.rate = cells[4];
                    rates.push(rate);
                }
            }
        });

        return rates;
    }

}
