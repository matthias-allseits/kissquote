import {Currency} from "./currency";
import {ShareheadBalance} from "./sharehead-balance";
import {ShareheadEstimation} from "./sharehead-estimation";
import {ChartData} from "chart.js";
import {Marketplace} from "./marketplace";
import {ShareheadAnalysisResults} from "./sharehead-analysis-results";
import {DateHelper} from "../core/datehelper";
import {ShareheadPlannedDividend} from "./sharehead-planned-dividend";
import {AnalystRating} from "./analyst-rating";
import {ShareheadTurningPoint} from "./sharehead-turning-point";
import {StockRate} from "./stock-rate";
import {Dividend} from "./dividend";
import {ShareheadHistoricDividend} from "./sharehead-historic-dividend";
import {Observable} from "rxjs";
import {SwissquoteHelper} from "../core/swissquote-helper";


export class ShareheadShare {

    constructor(
        public id: number,
        public shareheadId: number,
        public marketplace: Marketplace|undefined,
        public name: string|null,
        public shortname: string|null,
        public isin: string|null,
        public symbol?: string,
        public country?: string,
        public sector?: string,
        public financialYearEndDate?: Date|null,
        public nextReportDate?: Date|null,
        public urlFinanznet?: string,
        public urlWikipedia?: string,
        public urlInvesting?: string,
        public urlFinanztreff?: string,
        public urlDiviMax?: string,
        public urlYahoo?: string,
        public currency?: Currency,
        public ipoDate?: Date,
        public balances?: ShareheadBalance[],
        public estimations?: ShareheadEstimation[],
        public analysisResults?: ShareheadAnalysisResults,
        public plannedDividends?: ShareheadPlannedDividend[],
        public analystRatings?: AnalystRating[],
        public turningPoints?: ShareheadTurningPoint[],
        public historicDividends?: ShareheadHistoricDividend[],
        public lastRate?: StockRate,
        public positionId?: number,
        public isOnWatchlist?: boolean,
    ) { }


    swissquoteUrl(): string|null {
        if (this.marketplace) {
            let currency = this.currency?.name;
            if (currency == 'GBP') { // island apes...
                currency = 'GBX';
            }

            return `https://www.swissquote.ch/sq_mi/public/market/Detail.action?s=${this.isin}_${this.marketplace.urlKey}_${currency}`;
        }

        return null;
    }


    lastBalance(): ShareheadBalance|null
    {
        if (this.balances) {
            return this.balances[this.balances.length - 1];
        }

        return null;
    }


    lastEstimation(): ShareheadEstimation|null
    {
        const estimations = this.estimations;
        if (estimations !== undefined && estimations?.length > 0) {
            return estimations[estimations.length -1];
        }

        return null;
    }


    lastEstimationForYear(year: Date): ShareheadEstimation|null
    {
        let hit = null;
        if (this.estimations) {
            this.estimations.forEach(estimation => {
                if (estimation.year === year.getFullYear()) {
                    hit = estimation;
                }
            });
        }

        return hit;
    }


    numberOfAnalysts(): number|undefined
    {
        let lastEstimation = this.lastEstimation();
        if (null !== lastEstimation) {

            return lastEstimation.analysts;
        }

        return undefined;
    }


    yahooBalances(): ShareheadBalance[]
    {
        const hits: ShareheadBalance[] = [];
        this.balances?.forEach(balance => {
            if (balance.ordinarySharesNumber && balance.ordinarySharesNumber > 0) {
                hits.push(balance);
            }
        });

        return hits;
    }


    shareNumbersChanges(): number|null
    {
        let result = 0;
        const yahooBalances = this.yahooBalances();
        const first = yahooBalances[0];
        const last = yahooBalances[yahooBalances.length - 1];
        if (yahooBalances.length > 0 && first.ordinarySharesNumber && last.ordinarySharesNumber) {
            result = +((100 / first.ordinarySharesNumber * last.ordinarySharesNumber) - 100).toFixed(1);
        }

        return result;
    }


    kgv(lastRate: number): number|null
    {
        if (this.lastProfitPerShare() > 0) {

            return +(lastRate / this.lastProfitPerShare()).toFixed(0);
        } else {

            return null;
        }
    }


    lastDividend(): number|null
    {
        let hit = null;
        if (this.balances) {
            hit = this.balances[this.balances.length - 1].dividend;
        }

        return hit;
    }


    yield(lastRate: number)
    {
        let yieldnumber = 0;
        const lastDividend = this.lastDividend();
        if (lastDividend !== null) {
            yieldnumber = 100 / lastRate * lastDividend;
            yieldnumber = +yieldnumber.toFixed(1);
        }

        return yieldnumber;
    }


    getAvgDividendRaise()
    {
        const balances = this.workingBalancesByDate();
        if (balances.length > 0) {
            let raisesCount = balances.length - 1;
            let dividendStart = balances[0].dividend;
            const dividendEnd = balances[raisesCount].dividend;
            if (dividendStart == 0 && raisesCount > 0) {
                dividendStart = balances[1].dividend;
                raisesCount--;
            }
            if (dividendStart == 0 && raisesCount > 0) {
                dividendStart = balances[2].dividend;
                raisesCount--;
            }
            if (dividendStart == 0 && raisesCount > 0) {
                dividendStart = balances[3].dividend;
                raisesCount--;
            }

            if (dividendStart > 0 && dividendEnd > 0 && raisesCount > 0) {
                const result = ((Math.pow(dividendEnd / dividendStart, (1 / raisesCount)) - 1) * 100).toFixed(1);

                return result;
            }
        }

        return 0;
    }


    private workingBalancesByDate(): ShareheadBalance[]
    {
        const balances = this.balances ?? [];
        const filteredBalances = [];
        balances?.forEach(balance => {
            if (undefined === this.ipoDate || this.ipoDate.getFullYear() <= balance.year) {
                filteredBalances.push(balance);
            }
        });

        return balances;
    }


    private lastProfitPerShare(): number
    {
        let hit = 0;
        if (this.balances) {
            hit = this.balances[this.balances.length - 1].profitPerShare;
        }

        return hit;
    }


    public filteredRatings(): AnalystRating[] {
        let filtered: AnalystRating[] = [];
        const checkArray: string[] = [];
        this.analystRatings?.forEach(rating => {
            if (checkArray.indexOf(rating.analyst) < 0) {
                filtered.push(rating);
                checkArray.push(rating.analyst);
            }
        });
        filtered = filtered.slice(0, 10);

        return filtered;
    }


    salesChartData(date?: Date): ChartData {
        const chartData: ChartData = {
            labels: [],
            datasets: [
                {
                    data: [],
                    borderColor: [],
                    backgroundColor: [],
                    hoverBackgroundColor: []
                }
            ]
        };

        this.balances?.forEach(balance => {
            chartData.labels?.push(balance.year);
            chartData.datasets[0].data.push(balance.sales);
            if (Array.isArray(chartData.datasets[0].borderColor)) {
                chartData.datasets[0].borderColor.push('rgb(51, 102, 204, 1)');
            }
            if (Array.isArray(chartData.datasets[0].backgroundColor)) {
                chartData.datasets[0].backgroundColor.push('rgb(51, 102, 204, 1)');
            }
            if (Array.isArray(chartData.datasets[0].hoverBackgroundColor)) {
                chartData.datasets[0].hoverBackgroundColor.push('rgb(51, 102, 204, 0.4)');
            }
        });
        let year = new Date().getFullYear();
        if (date) {
            year = date.getFullYear() - 1;
        }
        for (let x = 1; x <= 3; x++) {
            const estimationYear = year + x;
            const estimationDate = new Date(estimationYear, 1, 1);
            const lastEstimation = this.lastEstimationForYear(estimationDate);
            if (lastEstimation) {
                chartData.labels?.push(lastEstimation.year);
                chartData.datasets[0].data.push(lastEstimation.sales);
                if (Array.isArray(chartData.datasets[0].borderColor)) {
                    chartData.datasets[0].borderColor.push('rgb(51, 102, 204, 0.4)');
                }
                if (Array.isArray(chartData.datasets[0].backgroundColor)) {
                    chartData.datasets[0].backgroundColor.push('rgb(51, 102, 204, 0.4)');
                }
                if (Array.isArray(chartData.datasets[0].hoverBackgroundColor)) {
                    chartData.datasets[0].hoverBackgroundColor.push('rgb(51, 102, 204, 0.2)');
                }
            }
        }

        return chartData;
    }


    profitChartData(date?: Date): ChartData {
        const chartData: ChartData = {
            labels: [],
            datasets: [
                {
                    data: [],
                    label: 'Profit per Share',
                    borderColor: 'rgb(51, 102, 204, 1)',
                    backgroundColor: 'rgb(51, 102, 204, 1)',
                    hoverBackgroundColor: 'rgb(51, 102, 204, 0.5)',
                    pointBackgroundColor: 'rgba(51, 102, 204, 1)',
                    pointHoverBackgroundColor: 'rgba(51, 102, 204, 1)',
                    pointHoverBorderColor: 'rgba(51, 102, 204, 1)',
                },
                {
                    data: [],
                    label: 'Estimated Profit per Share',
                    borderColor: 'rgb(51, 102, 204, 0.4)',
                    backgroundColor: 'rgb(51, 102, 204, 0.4)',
                    hoverBackgroundColor: 'rgb(51, 102, 204, 0.2)',
                    pointBackgroundColor: 'rgba(51, 102, 204, 0.4)',
                    pointHoverBackgroundColor: 'rgba(51, 102, 204, 0.4)',
                    pointHoverBorderColor: 'rgba(51, 102, 204, 0.4)',
                },
                {
                    data: [],
                    label: 'Dividend per Share',
                    borderColor: 'rgb(220, 57, 18, 1)',
                    backgroundColor: 'rgb(220, 57, 18, 1)',
                    hoverBackgroundColor: 'rgb(220, 57, 18, 0.5)',
                    pointBackgroundColor: 'rgb(220, 57, 18, 1)',
                    pointHoverBackgroundColor: 'rgba(220, 57, 18, 1)',
                    pointHoverBorderColor: 'rgba(220, 57, 18, 1)',
                },
                {
                    data: [],
                    label: 'Estimated Dividend per Share',
                    borderColor: 'rgb(220, 57, 18, 0.4)',
                    backgroundColor: 'rgb(220, 57, 18, 0.4)',
                    hoverBackgroundColor: 'rgb(220, 57, 18, 0.2)',
                    pointBackgroundColor: 'rgb(220, 57, 18, 0.4)',
                    pointHoverBackgroundColor: 'rgba(220, 57, 18, 0.4)',
                    pointHoverBorderColor: 'rgba(220, 57, 18, 0.4)',
                }
            ]
        };

        this.balances?.forEach(balance => {
            chartData.labels?.push(balance.year);
            chartData.datasets[0].data.push(balance.profitPerShare);
            chartData.datasets[1].data.push(NaN);
            chartData.datasets[2].data.push(balance.dividend);
            chartData.datasets[3].data.push(NaN);
        });
        chartData.datasets[1].data[chartData.datasets[1].data.length - 1] = chartData.datasets[0].data[chartData.datasets[0].data.length - 1];
        chartData.datasets[3].data[chartData.datasets[3].data.length - 1] = chartData.datasets[2].data[chartData.datasets[2].data.length - 1];

        let year = new Date().getFullYear();
        if (date) {
            year = date.getFullYear() - 1;
        }
        for (let x = 1; x <= 3; x++) {
            const estimationYear = year + x;
            const estimationDate = new Date(estimationYear, 1, 1);
            const lastEstimation = this.lastEstimationForYear(estimationDate);
            if (lastEstimation) {
                chartData.labels?.push(lastEstimation.year);
                chartData.datasets[0].data.push(NaN);
                chartData.datasets[1].data.push(lastEstimation.profitPerShare);
                chartData.datasets[2].data.push(NaN);
                chartData.datasets[3].data.push(lastEstimation.dividend);
            }
        }

        return chartData;
    }


    yearlyAverageRatesChartData(): ChartData {
        const chartData: ChartData = {
            labels: [],
            datasets: [
                {
                    data: [],
                    label: 'Average Rate',
                    borderColor: 'rgb(51, 102, 204, 1)',
                    backgroundColor: 'rgb(51, 102, 204, 1)',
                    hoverBackgroundColor: 'rgb(51, 102, 204, 0.5)',
                    pointBackgroundColor: 'rgba(51, 102, 204, 1)',
                    pointHoverBackgroundColor: 'rgba(51, 102, 204, 1)',
                    pointHoverBorderColor: 'rgba(51, 102, 204, 1)',
                }
            ]
        };

        this.balances?.forEach(balance => {
            chartData.labels?.push(balance.year);
            chartData.datasets[0].data.push(balance.avgRate);
        });

        return chartData;
    }


    equityRatesChartData(): ChartData {
        const chartData: ChartData = {
            labels: [],
            datasets: [
                {
                    data: [],
                    label: 'Equity Ratio',
                    borderColor: 'rgb(51, 102, 204, 1)',
                    backgroundColor: 'rgb(51, 102, 204, 1)',
                    hoverBackgroundColor: 'rgb(51, 102, 204, 0.5)',
                    pointBackgroundColor: 'rgba(51, 102, 204, 1)',
                    pointHoverBackgroundColor: 'rgba(51, 102, 204, 1)',
                    pointHoverBorderColor: 'rgba(51, 102, 204, 1)',
                }
            ]
        };

        this.balances?.forEach(balance => {
            if (balance.equityRatio > 0) {
                chartData.labels?.push(balance.year);
                chartData.datasets[0].data.push(balance.equityRatio);
            }
        });

        return chartData;
    }


    estimationChangesChartData(last = false): ChartData {
        const chartData: ChartData = {
            labels: [],
            datasets: [
                {
                    data: [],
                    label: 'Profit per Share',
                    borderColor: 'rgb(51, 102, 204, 1)',
                    backgroundColor: 'rgb(51, 102, 204, 1)',
                    hoverBackgroundColor: 'rgb(51, 102, 204, 0.5)',
                    pointBackgroundColor: 'rgba(51, 102, 204, 1)',
                    pointHoverBackgroundColor: 'rgba(51, 102, 204, 1)',
                    pointHoverBorderColor: 'rgba(51, 102, 204, 1)',
                },
                {
                    data: [],
                    label: 'Dividend per Share',
                    borderColor: 'rgb(220, 57, 18, 1)',
                    backgroundColor: 'rgb(220, 57, 18, 1)',
                    hoverBackgroundColor: 'rgb(220, 57, 18, 0.5)',
                    pointBackgroundColor: 'rgb(220, 57, 18, 1)',
                    pointHoverBackgroundColor: 'rgba(220, 57, 18, 1)',
                    pointHoverBorderColor: 'rgba(220, 57, 18, 1)',
                }
            ]
        };

        if (last) {
            this.analysisResults?.estimationChangesOverNext?.forEach(estimation => {
                chartData.labels?.push(DateHelper.convertDateToGerman(estimation.date));
                chartData.datasets[0].data.push(estimation.profitPerShare);
                chartData.datasets[1].data.push(estimation.dividend);
            });
        } else {
            this.analysisResults?.estimationChanges?.forEach(estimation => {
                chartData.labels?.push(DateHelper.convertDateToGerman(estimation.date));
                chartData.datasets[0].data.push(estimation.profitPerShare);
                chartData.datasets[1].data.push(estimation.dividend);
            });
        }

        return chartData;
    }


    debtChartData(): ChartData {
        const chartData: ChartData = {
            labels: [],
            datasets: [
                {
                    data: [],
                    label: 'NetDebt-Profit-Ratio',
                    borderColor: 'rgb(220, 57, 18, 1)',
                    backgroundColor: 'rgb(220, 57, 18, 1)',
                    hoverBackgroundColor: 'rgb(220, 57, 18, 0.5)',
                    pointBackgroundColor: 'rgb(220, 57, 18, 1)',
                    pointBorderColor: 'rgb(220, 57, 18, 0)',
                    pointHoverBackgroundColor: 'rgba(220, 57, 18, 1)',
                    pointHoverBorderColor: 'rgba(220, 57, 18, 1)',
                },
                {
                    data: [],
                    label: 'Net debt (Mia.)',
                    borderColor: 'rgb(51, 102, 204, 1)',
                    backgroundColor: 'rgb(51, 102, 204, 1)',
                    hoverBackgroundColor: 'rgb(51, 102, 204, 0.5)',
                    type: 'bar',
                }
            ]
        };

        this.yahooBalances()?.forEach(balance => {
            if (balance.debtNet) {
                chartData.labels?.push(balance.year);
                chartData.datasets[0].data.push(balance.netDebtRatio());
                chartData.datasets[1].data.push(balance.debtNet / 1000000);
            }
        });

        return chartData;
    }


    shareNumbersChartData(): ChartData {
        const chartData: ChartData = {
            labels: [],
            datasets: [
                {
                    data: [],
                    label: 'Ordinary',
                    borderColor: 'rgb(51, 102, 204, 1)',
                    backgroundColor: 'rgb(51, 102, 204, 1)',
                    hoverBackgroundColor: 'rgb(51, 102, 204, 0.5)',
                    pointBackgroundColor: 'rgba(51, 102, 204, 1)',
                    pointHoverBackgroundColor: 'rgba(51, 102, 204, 1)',
                    pointHoverBorderColor: 'rgba(51, 102, 204, 1)',
                },
                {
                    data: [],
                    label: 'Treasury',
                    borderColor: 'rgb(220, 57, 18, 1)',
                    backgroundColor: 'rgb(220, 57, 18, 1)',
                    hoverBackgroundColor: 'rgb(220, 57, 18, 0.5)',
                    pointBackgroundColor: 'rgb(220, 57, 18, 1)',
                    pointHoverBackgroundColor: 'rgba(220, 57, 18, 1)',
                    pointHoverBorderColor: 'rgba(220, 57, 18, 1)',
                }
            ]
        };

        this.yahooBalances()?.forEach(balance => {
            if (balance.ordinarySharesNumber !== undefined && balance.treasurySharesNumber !== undefined) {
                chartData.labels?.push(balance.year);
                chartData.datasets[0].data.push(balance.ordinarySharesNumber);
                chartData.datasets[1].data.push(balance.treasurySharesNumber);
            }
        });

        return chartData;
    }


    historicDividendsChartData(): ChartData {
        const chartData: ChartData = {
            labels: [],
            datasets: [
                {
                    data: [],
                    label: 'Dividend',
                    borderColor: 'rgb(51, 102, 204, 1)',
                    backgroundColor: 'rgb(51, 102, 204, 1)',
                    hoverBackgroundColor: 'rgb(51, 102, 204, 0.5)',
                    pointBackgroundColor: 'rgba(51, 102, 204, 1)',
                    pointHoverBackgroundColor: 'rgba(51, 102, 204, 1)',
                    pointHoverBorderColor: 'rgba(51, 102, 204, 1)',
                }
            ]
        };

        this.historicDividends?.forEach(dividend => {
            if (dividend.dividend !== undefined) {
                chartData.labels?.push(dividend.year);
                chartData.datasets[0].data.push(dividend.dividend);
            }
        });

        return chartData;
    }


    public getStockRates(): Observable<StockRate[]> {
        return new Observable(obsData => {
            if (this.currency) {
                let currencyName = this.currency.name;
                if (currencyName === 'GBP') {
                    currencyName = 'GBX';
                }
                let request = new XMLHttpRequest();
                const ratesUrl = `https://www.swissquote.ch/sqi_ws/HistoFromServlet?format=pipe&key=${this.isin}_${this.marketplace?.urlKey}_${currencyName}&ftype=day&fvalue=1&ptype=a&pvalue=1`;
                request.open("GET", ratesUrl, false);
                request.send(null);
                let content = request.responseText;
                // console.log(content);
                const rates = SwissquoteHelper.parseRates(content, new Date(1970, 1, 1), 10000);

                obsData.next(rates);
            }
        });
    }


    hadNegativeBalances(): boolean {
        let result = false;
        this.balances?.forEach(balance => {
            if (balance.profitPerShare < 0) {
                result = true;
            }
        });

        return result;
    }


    balancesCurrency(): string
    {
        const currencies = [];
        currencies.push(this.currency?.name);
        this.balances?.forEach(balance => {
            if (balance.currency) {
                currencies.push(balance.currency.name);
            } else {
                currencies.push('Unknown');
            }
        });
        const unique = [...new Set(currencies)]

        const result = unique.join('/');

        return result;
    }


    estimationsCurrency(): string
    {
        const currencies: string[] = [];
        // currencies.push(this.currency?.name);
        this.estimations?.forEach(estimation => {
            if (estimation.currency && estimation.currency.name) {
                currencies.push(estimation.currency.name);
            } else {
                currencies.push('Unknown');
            }
        });
        const unique = [...new Set(currencies)]

        const result = unique.join('/');

        return result;
    }


    estimationsByYear(year: number): ShareheadEstimation|null {
        let hit = null;
        this.estimations?.forEach(estimation => {
            if (estimation.year === year) {
                hit = estimation;
            }
        });

        return hit;
    }


    postCoronaTop(): ShareheadTurningPoint|undefined
    {
        let result = undefined;
        const allPoints = this.turningPoints;
        allPoints?.forEach(point => {
            const year = point.date.getFullYear();
            if ([2021, 2022, 2023].indexOf(year) > -1 && point.type === 'top') {
                result = point;
            }
        });

        return result;
    }


    financialCrisisDrawdown(): number|null
    {
        const top = this.financialCrisisTop();
        const bottom = this.financialCrisisBottom();
        if (top && bottom) {

            return +((100 / top.rate * bottom.rate) - 100).toFixed(1);
        }

        return null;
    }


    financialCrisisTop(): ShareheadTurningPoint|undefined
    {
        let result = undefined;
        const allPoints = this.turningPoints;
        allPoints?.forEach(point => {
            const year = point.date.getFullYear();
            if ([2007, 2008].indexOf(year) > -1 && point.type === 'top') {
                result = point;
            }
        });

        return result;
    }


    financialCrisisBottom(): ShareheadTurningPoint|undefined
    {
        let result = undefined;
        const allPoints = this.turningPoints;
        allPoints?.forEach(point => {
            const year = point.date.getFullYear();
            if ([2008, 2009].indexOf(year) > -1 && point.type === 'bottom') {

                result = point;
            }
        });

        return result;
    }


    coronaPandemicDrawdown(): number|null
    {
        const top = this.coronaPandemicTop();
        const bottom = this.coronaPandemicBottom();
        if (top && bottom) {

            return +((100 / top.rate * bottom.rate) - 100).toFixed(1);
        }

        return null;
    }


    coronaPandemicTop(): ShareheadTurningPoint|undefined
    {
        let result = undefined;
        const allPoints = this.turningPoints;
        allPoints?.forEach(point => {
            const year = point.date.getFullYear();
            if ([2019, 2020].indexOf(year) > -1 && point.type === 'top') {

                result = point;
            }
        });

        return result;
    }


    coronaPandemicBottom(): ShareheadTurningPoint|undefined
    {
        let result = undefined;
        const allPoints = this.turningPoints;
        allPoints?.forEach(point => {
            const year = point.date.getFullYear();
            if ([2019, 2020].indexOf(year) > -1 && point.type === 'bottom') {

                result = point;
            }
        });

        return result;
    }


    dividendByYear(year: number): number|undefined
    {
        let result = undefined;
        this.historicDividends?.forEach(histDivi => {
            if (histDivi.year === year) {
                result = histDivi.dividend;
            }
        });

        return result;
    }


    financialCrisisDividendDrop(): number|undefined
    {
        const top = this.dividendByYear(2007);
        const bottom = this.dividendByYear(2008);
        if (top !== undefined && bottom !== undefined) {

            return +(((100 / top * bottom) - 100) * -1).toFixed(0);
        }

        return undefined;
    }


    coronaCrisisDividendDrop(): number|undefined
    {
        const top = this.dividendByYear(2018);
        const bottom = this.dividendByYear(2019);
        if (top !== undefined && bottom !== undefined) {

            return +(((100 / top * bottom) - 100) * -1).toFixed(0);
        }

        return undefined;
    }


    worstEverDividendDrop(): any[]
    {
        let result = 0;
        let resultNote = 'no drop happened';
        let last = 0;
        let lastYear = 0;
        if (this.historicDividends && this.historicDividends.length > 0) {
            last = this.historicDividends[0].dividend;
            lastYear = this.historicDividends[0].year;
            this.historicDividends?.forEach(histDivi => {
                if (last > histDivi.dividend) {
                    const tempResult = +(((100 / last * histDivi.dividend) - 100) * -1).toFixed(0);
                    if (tempResult > result) {
                        result = tempResult;
                        resultNote = lastYear + ' - ' + histDivi.year;
                        if ([2001, 2002, 2003].indexOf(histDivi.year) > -1) {
                            resultNote = 'by dot-com bubble';
                        }
                        if ([2008, 2009].indexOf(histDivi.year) > -1) {
                            resultNote = 'by financial crisis';
                        }
                        if ([2019, 2020].indexOf(histDivi.year) > -1) {
                            resultNote = 'by corona pandemic';
                        }
                    }
                }
                last = histDivi.dividend;
                lastYear = histDivi.year;
            });
        }

        return [result, resultNote];
    }

}
