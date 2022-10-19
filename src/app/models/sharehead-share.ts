import {Currency} from "./currency";
import {ShareheadBalance} from "./sharehead-balance";
import {ShareheadEstimation} from "./sharehead-estimation";
import {ChartData} from "chart.js";
import {Marketplace} from "./marketplace";
import {ShareheadAnalysisResults} from "./sharehead-analysis-results";
import {DateHelper} from "../core/datehelper";
import {ShareheadPlannedDividend} from "./sharehead-planned-dividend";
import {AnalystRating} from "./analyst-rating";


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
        public currency?: Currency,
        public balances?: ShareheadBalance[],
        public estimations?: ShareheadEstimation[],
        public analysisResults?: ShareheadAnalysisResults,
        public plannedDividends?: ShareheadPlannedDividend[],
        public analystRatings?: AnalystRating[],
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


    salesChartData(): ChartData {
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


    profitChartData(): ChartData {
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

}
