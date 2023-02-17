import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Position} from "../../models/position";
import {Transaction} from "../../models/transaction";
import {DateHelper} from "../../core/datehelper";
import {StockRate} from "../../models/stock-rate";

@Component({
    selector: 'app-share-bar-chart',
    templateUrl: './share-bar-chart.component.html',
    styleUrls: ['./share-bar-chart.component.scss']
})
export class ShareBarChartComponent implements OnInit, AfterViewInit {

    @ViewChild('myCanvas', {static: true}) myCanvas?: ElementRef<HTMLCanvasElement>;

    @Input() rates?: StockRate[];
    @Input() position?: Position;

    public canvasWidth = 700;
    public canvasHeight = 320;
    private offsetTop = 10;
    private offsetBottom = 10;
    private offsetLeft = 30;

    private context: any;
    private strokeColor = '#3366cc';
    private redColor = 'red';
    private greenColor = 'green';
    private helplineColor = '#dee2e6';
    private monthColor = '#a4a4a4';
    private textColor = '#4e4e4e';
    private stepWidth = 6;
    private barSpan = 5;

    constructor() {
    }

    ngOnInit(): void {
        if (screen.width < 400) {
            this.canvasWidth = 335;
        }
    }

    ngAfterViewInit(): void {
        if (this.myCanvas && this.rates) {
            this.context = this.myCanvas.nativeElement.getContext('2d');
            const topRate = this.calculateTopEnd(this.rates);
            const lowRate = this.calculateLowEnd(this.rates);
            // console.log('topRate: ' + topRate);
            // console.log('lowRate: ' + lowRate);
            const verticalSteps = this.calculateVerticalSteps(topRate, lowRate);
            // console.log('vertical-steps: ' + verticalSteps);
            const topEnd = Math.ceil(topRate / verticalSteps) * verticalSteps;
            const lowEnd = Math.floor(lowRate / verticalSteps) * verticalSteps;
            const verticalFactor = (this.canvasHeight - this.offsetTop - this.offsetBottom) / (topEnd - lowEnd);
            // console.log('topEnd: ' + topEnd);
            // console.log('lowEnd: ' + lowEnd);
            // console.log('factor: ' + verticalFactor);

            // preparing transactions
            const transactionsSell: Transaction[] = [];
            const transactionsBuy: Transaction[] = [];
            this.position?.transactions.forEach(transaction => {
                if (transaction.title === 'Kauf') {
                    transactionsBuy.push(transaction);
                } else if (transaction.title === 'Verkauf') {
                    transactionsSell.push(transaction);
                }
            });
            // console.log(transactionsBuy);

            // horizontal help-lines
            this.context.strokeStyle = this.helplineColor;
            this.context.fillStyle = this.textColor;
            this.context.lineWidth = 1;
            let yRate = topEnd;
            if (verticalSteps < 1) {
                yRate = Math.round(yRate * 10) / 10;
            }
            do {
                // console.log(yRate);
                const yValue = ((topEnd - yRate) * verticalFactor) + this.offsetTop;
                // console.log(yValue);
                this.context.moveTo(this.offsetLeft, yValue);
                this.context.lineTo(this.canvasWidth, yValue);
                this.context.stroke();
                this.context.font = '14px sans-serif';
                this.context.textBaseline = 'middle';
                this.context.direction = 'rtl';
                this.context.fillText(yRate.toString(), 25, yValue);
                yRate -= verticalSteps;
                if (verticalSteps < 1) {
                    yRate = Math.round(yRate * 10) / 10;
                }
            } while (yRate >= lowEnd);

            // monthly helplines
            this.context.strokeStyle = this.helplineColor;
            this.context.beginPath();
            this.context.setLineDash([]);
            let lastMonth: number;
            let lastYear: number;

            const chunkedRates = [];
            for (let i = 0; i < this.rates.length; i += this.barSpan) {
                chunkedRates.push(this.rates.slice(i, i + this.barSpan));
            }
            chunkedRates.forEach((rates, i) => {
                const lastRate = rates[rates.length - 1];
                if (lastYear !== undefined && lastYear !== lastRate.date.getFullYear()) {
                    this.context.strokeStyle = this.monthColor;
                    this.context.beginPath();
                    const xValue = this.offsetLeft + ((i * this.stepWidth) + 3);
                    this.context.moveTo(xValue, this.offsetTop);
                    this.context.lineTo(xValue, this.canvasHeight);
                    this.context.stroke();
                } else if (lastMonth !== undefined && lastMonth !== lastRate.date.getMonth()) {
                    this.context.strokeStyle = this.helplineColor;
                    this.context.beginPath();
                    const xValue = this.offsetLeft + ((i * this.stepWidth) + 3);
                    this.context.moveTo(xValue, this.offsetTop);
                    this.context.lineTo(xValue, this.canvasHeight);
                    this.context.stroke();
                }
                lastMonth = lastRate.date.getMonth();
                lastYear = lastRate.date.getFullYear();
            });

            // transaction lines
            this.context.beginPath();
            this.context.strokeStyle = this.textColor;
            this.context.setLineDash([5, 5]);
            chunkedRates.forEach((rates, i) => {
                const lastRate = rates[rates.length - 1];
                const entryDates: Date[] = [];
                rates.forEach(rate => {
                    entryDates.push(rate.date);
                });
                transactionsSell.forEach(transaction => {
                    if (transaction.date instanceof Date && transaction.rate) {
                        let hit = false;
                        entryDates.forEach(date => {
                            if (transaction.date instanceof Date && DateHelper.datesAreEqual(transaction.date, date)) {
                                hit = true;
                            }
                        });
                        if (hit) {
                            this.context.strokeStyle = this.redColor;
                            this.context.beginPath();
                            const xValue = this.offsetLeft + ((i * this.stepWidth) + 3);
                            let transactionsRate = transaction.rate;
                            if (this.position?.currency?.name === 'GBP') {
                                transactionsRate *= 100;
                            }
                            const yValue = ((topEnd - transactionsRate) * verticalFactor) + this.offsetTop;
                            this.context.moveTo(xValue, this.offsetTop - 10);
                            this.context.lineTo(xValue, yValue);
                            this.context.stroke();
                        }
                    }
                });
                transactionsBuy.forEach(transaction => {
                    if (transaction.date instanceof Date && transaction.rate) {
                        let hit = false;
                        entryDates.forEach(date => {
                            if (transaction.date instanceof Date && DateHelper.datesAreEqual(transaction.date, date)) {
                                hit = true;
                            }
                        });
                        if (hit) {
                            this.context.beginPath();
                            this.context.strokeStyle = this.greenColor;
                            const xValue = this.offsetLeft + ((i * this.stepWidth) + 3);
                            let transactionsRate = transaction.rate;
                            if (this.position?.currency?.name === 'GBP') {
                                transactionsRate *= 100;
                            }
                            const yValue = ((topEnd - transactionsRate) * verticalFactor) + this.offsetTop;
                            this.context.moveTo(xValue, this.offsetTop - 10);
                            this.context.lineTo(xValue, yValue);
                            this.context.stroke();
                        }
                    }
                });
                lastMonth = lastRate.date.getMonth();
                lastYear = lastRate.date.getFullYear();
            });

            // average-price
            if (this.position?.balance) {
                this.context.beginPath();
                this.context.strokeStyle = this.redColor;
                this.context.setLineDash([5, 5]);
                let avgPriceForChart = this.position?.balance?.averagePayedPriceGross;
                if (this.position.currency?.name === 'GBP') {
                    avgPriceForChart *= 100;
                }
                const buyValue = ((topEnd - avgPriceForChart) * verticalFactor) + this.offsetTop;
                // console.log('average-price: ' + this.position?.balance?.averagePayedPriceNet);
                // console.log('buyValue: ' + buyValue);
                this.context.moveTo(this.offsetLeft, buyValue);
                this.context.lineTo(this.canvasWidth, buyValue);
                this.context.stroke();
            }

            // rates
            this.context.beginPath();
            this.context.strokeStyle = this.strokeColor;
            this.context.setLineDash([]);
            this.context.lineWidth = 1;
            // const firstValue = ((topEnd - this.rates[0].rate) * verticalFactor) + this.offsetTop;
            // console.log('firstValue: ' + firstValue);
            // this.context.moveTo(this.offsetLeft, firstValue);
            let xValue = this.offsetLeft;
            chunkedRates.forEach((rates, i) => {
                const firstRate = rates[0];
                const lastRate = rates[rates.length - 1];
                const yValue = ((topEnd - firstRate.rate) * verticalFactor) + this.offsetTop;
                this.context.moveTo(xValue, yValue);
                this.context.lineTo(xValue + 3, yValue);
                this.context.stroke();

                const yLValue = ((topEnd - lastRate.rate) * verticalFactor) + this.offsetTop;
                this.context.moveTo(xValue + 3, yLValue);
                this.context.lineTo(xValue + 6, yLValue);
                this.context.stroke();

                const topValue = this.extractTopValue(rates);
                const lowValue = this.extractLowValue(rates);
                const yTopValue = ((topEnd - topValue) * verticalFactor) + this.offsetTop;
                const yLowValue = ((topEnd - lowValue) * verticalFactor) + this.offsetTop;
                this.context.moveTo(xValue + 3, yTopValue);
                this.context.lineTo(xValue + 3, yLowValue);
                this.context.stroke();
                xValue += this.stepWidth;
            });
        }
    }


    private calculateVerticalSteps(topRate: number, lowRate: number) {
        let verticalSteps = 50;
        const delta = topRate - lowRate;
        // console.log('delta: ' + delta);
        if (delta < 2) {
            verticalSteps = 0.1;
        } else if (delta < 5) {
            verticalSteps = 0.5;
        } else if (delta < 10) {
            verticalSteps = 1;
        } else if (delta < 20) {
            verticalSteps = 2;
        } else if (delta < 30) {
            verticalSteps = 5;
        } else if (delta < 100) {
            verticalSteps = 10;
        } else if (delta < 200) {
            verticalSteps = 20;
        } else if (delta < 300) {
            verticalSteps = 25;
        }

        return verticalSteps;
    }

    private calculateTopEnd(rates: StockRate[]) {
        let topRate = 0;
        rates.forEach(entry => {
            if (entry.high > topRate) {
                topRate = entry.high;
            }
        });

        // console.log('topRate: ' + topRate);
        return topRate;
    }

    private calculateLowEnd(rates: StockRate[]) {
        let lowRate = 10000000000;
        rates.forEach(entry => {
            if (entry.low < lowRate) {
                lowRate = entry.low;
            }
        });

        // console.log('lowRate: ' + lowRate);
        return lowRate;
    }

    private extractTopValue(rates: StockRate[]) {
        let top = 0;
        rates.forEach(rate => {
            if (rate.high > top) {
                top = rate.high;
            }
        })

        return top;
    }

    private extractLowValue(rates: StockRate[]) {
        let low = 10000000000;
        rates.forEach(rate => {
            if (rate.low < low) {
                low = rate.low;
            }
        })

        return low;
    }

}
