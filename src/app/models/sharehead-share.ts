import {Currency} from "./currency";
import {ShareheadBalance} from "./sharehead-balance";
import {ShareheadEstimation} from "./sharehead-estimation";
import {ChartData} from "chart.js";
import {Marketplace} from "./marketplace";
import {ShareheadAnalysisResults} from "./sharehead-analysis-results";
import {DateHelper} from "../core/datehelper";


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
        public urlFinanznet?: string,
        public urlWikipedia?: string,
        public urlInvesting?: string,
        public urlFinanztreff?: string,
        public currency?: Currency,
        public balances?: ShareheadBalance[],
        public estimations?: ShareheadEstimation[],
        public analysisResults?: ShareheadAnalysisResults,
    ) { }


    dividendProjectionForYear(year: Date): ShareheadEstimation|null
    {
        const estimation = this.lastEstimationForYear(year);
        if (estimation) {
            return estimation;
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


    salesChartData(): ChartData {
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

        this.balances?.forEach(balance => {
            chartData.labels?.push(balance.year);
            chartData.datasets[0].data.push(balance.sales);
        });

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

        this.balances?.forEach(balance => {
            chartData.labels?.push(balance.year);
            chartData.datasets[0].data.push(balance.profitPerShare);
            chartData.datasets[1].data.push(balance.dividend);
        });

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


    estimationChangesChartData(): ChartData {
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

        this.analysisResults?.estimationChanges?.forEach(estimation => {
            chartData.labels?.push(DateHelper.convertDateToGerman(estimation.date));
            chartData.datasets[0].data.push(estimation.profitPerShare);
            chartData.datasets[1].data.push(estimation.dividend);
        });

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
