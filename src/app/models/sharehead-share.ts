import {Currency} from "./currency";
import {ShareheadBalance} from "./sharehead-balance";
import {ShareheadEstimation} from "./sharehead-estimation";
import {ChartData} from "chart.js";
import {Marketplace} from "./marketplace";


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
    ) { }


    dividendProjectionForYear(year: Date): ShareheadEstimation|null
    {
        const estimation = this.lastEstimationForYear(year);
        if (estimation) {
            return estimation;
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
                    borderColor: 'rgb(51, 102, 204, 1)',
                    backgroundColor: 'rgb(51, 102, 204, 1)',
                    hoverBackgroundColor: 'rgb(51, 102, 204, 0.5)'
                }
            ]
        };

        this.balances?.forEach(balance => {
            chartData.labels?.push(balance.year);
            chartData.datasets[0].data.push(balance.profitPerShare);
        });

        return chartData;
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
