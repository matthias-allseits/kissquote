import {Currency} from './currency';
import {Share} from './share';
import {Transaction} from "./transaction";
import {BankAccount} from "./bank-account";
import {Balance} from "./balance";
import {ChartData} from "chart.js";
import {StockRate} from "./stock-rate";
import {StockRateCreator} from "../creators/stock-rate-creator";
import {DateHelper} from "../core/datehelper";


export class Position {

    constructor(
        public id: number,
        public share: Share|null,
        public currency: Currency|null,
        public active: boolean,
        public activeFrom: Date|string,
        public activeUntil: Date|null,
        public transactions: Transaction[],
        public isCash: boolean = false,
        public bankAccount?: BankAccount,
        public balance?: Balance,
        public shareheadId?: number,
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


    // todo: this is crap
    public quantityTotal(): number {
        let quantity = 0;
        this.transactions.forEach(transaction => {
            quantity += transaction.quantity;
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


    public actualValue(): string|null {
        if (!this.isCash) {
            if (this.balance && this.balance.lastRate) {
                return (this.balance.amount * this.balance.lastRate.rate).toFixed(0)
            }
        } else {
            if (this.balance && this.balance.cashValue) {
                return this.balance?.cashValue.toString();
            }
        }

        return null;
    }


    public urlSwissquote(): string|null {
        if (this.share) {
            return `https://www.swissquote.ch/sq_mi/market/Detail.action?s=${this.share.isin}_${this.share.marketplace?.urlKey}_${this.currency?.name}`;
        }

        return null;
    }


    public getRatesChartData(): ChartData {
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
                    label: 'Kurs seit Start',
                    backgroundColor: 'rgba(255,102,51,0)',
                    borderColor: '#ff6633',
                    pointBackgroundColor: '#c9461a',
                    pointBorderColor: '#ff6633',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#ff6633',
                    fill: 'origin'
                }
            ],
            labels: historicLabels
        };

        return data;
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
