import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Position} from "../../models/position";
import {Transaction} from "../../models/transaction";
import {DateHelper} from "../../core/datehelper";
import {StockRate} from "../../models/stock-rate";
import {CanvasHelper} from "../../core/canvas-helper";


@Component({
    selector: 'app-share-bar-chart',
    templateUrl: './share-bar-chart.component.html',
    styleUrls: ['./share-bar-chart.component.scss']
})
export class ShareBarChartComponent implements OnInit, AfterViewInit {

    @ViewChild('myCanvas', {static: true}) myCanvas?: ElementRef<HTMLCanvasElement>;

    @Input() rates?: StockRate[];
    @Input() position?: Position;
    @Input() type = 'daily';

    public canvasWidth = 700;
    public canvasHeight = 320;
    private offsetTop = 10;
    private offsetBottom = 10;
    private offsetLeft = 30;

    private context: any;
    private strokeColor = '#3366cc';
    private redColor = 'red';
    private greenColor = 'green';
    private blackColor = 'black';
    private yellowColor = '#e0c103';
    private helplineColor = '#dee2e6';
    private monthColor = '#a4a4a4';
    private textColor = '#4e4e4e';
    private stepWidth = 6;

    constructor() {
    }

    ngOnInit(): void {
        if (screen.width < 400) {
            this.canvasWidth = 335;
        }
    }

    ngAfterViewInit(): void {
        if (this.myCanvas && this.rates) {
            const chunkedRates = this.chunkRates();

            this.context = this.myCanvas.nativeElement.getContext('2d');
            const topRate = this.calculateTopEnd(chunkedRates, this.position?.targetPrice);
            const lowRate = this.calculateLowEnd(chunkedRates, this.position?.stopLoss, this.position?.targetPrice);
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
                // console.log('yRate: ', yRate);
                const yValue = CanvasHelper.optimizeCoordinate(((topEnd - yRate) * verticalFactor) + this.offsetTop);
                // console.log(yValue);
                this.context.moveTo(this.offsetLeft, yValue);
                this.context.lineTo(this.canvasWidth, yValue);
                this.context.stroke();
                this.context.font = '14px sans-serif';
                this.context.textBaseline = 'middle';
                this.context.direction = 'rtl';
                if (yRate < 1000) {
                    this.context.fillText(yRate.toString(), 25, yValue);
                } else {
                    if (verticalSteps > 500) {
                        this.context.fillText((yRate/1000).toFixed(0) + 'k', 26, yValue);
                    } else {
                        this.context.fillText((yRate/1000).toFixed(1) + 'k', 26, yValue);
                    }
                }
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

            chunkedRates.forEach((rates, i) => {
                const lastRate = rates[rates.length - 1];
                if (lastYear !== undefined && lastYear !== lastRate.date.getFullYear()) {
                    this.context.strokeStyle = this.monthColor;
                    this.context.beginPath();
                    let xValue = CanvasHelper.optimizeCoordinate(this.offsetLeft + ((i * this.stepWidth) + 3));
                    if (this.type === 'monthly' || this.type === 'double-monthly') {
                        if (lastRate.date.getFullYear() % 10 === 0) {
                            this.context.lineWidth = 1.5;
                        } else {
                            this.context.lineWidth = 1;
                        }
                        xValue = CanvasHelper.optimizeCoordinate(this.offsetLeft + ((i * this.stepWidth)));
                    }
                    this.context.moveTo(xValue, this.offsetTop);
                    this.context.lineTo(xValue, this.canvasHeight);
                    this.context.stroke();
                } else if (lastMonth !== undefined && lastMonth !== lastRate.date.getMonth()) {
                    if (this.type !== 'monthly' && this.type !== 'double-monthly') {
                        this.context.strokeStyle = this.helplineColor;
                        this.context.beginPath();
                        const xValue = CanvasHelper.optimizeCoordinate(this.offsetLeft + ((i * this.stepWidth) + 3));
                        this.context.moveTo(xValue, this.offsetTop);
                        this.context.lineTo(xValue, this.canvasHeight);
                        this.context.stroke();
                    }
                }
                this.context.lineWidth = 1;
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
                            const xValue = CanvasHelper.optimizeCoordinate(this.offsetLeft + ((i * this.stepWidth) + 3));
                            let transactionsRate = transaction.rate;
                            if (this.position?.share?.name && this.position?.share?.name.indexOf('BRC') > -1) {
                                transactionsRate /= 10;
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
                        let transactionsRate = transaction.rate;
                        // todo: this is a hack for the position BCV. implement a serious solution for the split-problematic
                        if (this.position && this.position.shareheadId === 1238 && transaction.date.getFullYear() === 2019) {
                            transactionsRate = transactionsRate / 10;
                        }
                        let hit = false;
                        entryDates.forEach(date => {
                            if (transaction.date instanceof Date && DateHelper.datesAreEqual(transaction.date, date)) {
                                hit = true;
                            }
                        });
                        if (hit) {
                            this.context.beginPath();
                            this.context.strokeStyle = this.greenColor;
                            const xValue = CanvasHelper.optimizeCoordinate(this.offsetLeft + ((i * this.stepWidth) + 3));
                            if (this.position?.share?.name && this.position?.share?.name.indexOf('BRC') > -1) {
                                transactionsRate /= 10;
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
                if (this.position?.share?.name && this.position?.share?.name.indexOf('BRC') > -1) {
                    avgPriceForChart /= 10;
                }
                const buyValue = CanvasHelper.optimizeCoordinate(((topEnd - avgPriceForChart) * verticalFactor) + this.offsetTop);
                this.context.moveTo(this.offsetLeft, buyValue);
                this.context.lineTo(this.canvasWidth, buyValue);
                this.context.stroke();
            }

            // break-even
            if (this.position?.balance && +this.position.balance.returnOnInvestentByDividends() > 5) {
                this.context.beginPath();
                this.context.strokeStyle = this.yellowColor;
                this.context.setLineDash([5, 5]);
                let breakEvenForChart = this.position?.balance?.breakEvenPrice;
                if (this.position?.share?.name && this.position?.share?.name.indexOf('BRC') > -1) {
                    breakEvenForChart /= 10;
                }
                const breakEvenValue = CanvasHelper.optimizeCoordinate(((topEnd - breakEvenForChart) * verticalFactor) + this.offsetTop);
                this.context.moveTo(this.offsetLeft, breakEvenValue);
                this.context.lineTo(this.canvasWidth, breakEvenValue);
                this.context.stroke();
            }

            // stop-loss
            if (this.position?.balance && this.position.stopLoss) {
                this.context.beginPath();
                this.context.strokeStyle = this.blackColor;
                this.context.setLineDash([5, 5]);
                let stopLossForChart = this.position.stopLoss;
                const stopLossValue = CanvasHelper.optimizeCoordinate(((topEnd - stopLossForChart) * verticalFactor) + this.offsetTop);
                this.context.moveTo(this.offsetLeft, stopLossValue);
                this.context.lineTo(this.canvasWidth, stopLossValue);
                this.context.stroke();
            }

            // target-price
            if (this.position?.balance && this.position.targetPrice) {
                this.context.beginPath();
                this.context.strokeStyle = this.greenColor;
                this.context.setLineDash([5, 5]);
                let targetPriceForChart = this.position.targetPrice;
                const stopLossValue = CanvasHelper.optimizeCoordinate(((topEnd - targetPriceForChart) * verticalFactor) + this.offsetTop);
                this.context.moveTo(this.offsetLeft, stopLossValue);
                this.context.lineTo(this.canvasWidth, stopLossValue);
                this.context.stroke();
            }

            // rates
            this.context.beginPath();
            this.context.strokeStyle = this.strokeColor;
            this.context.setLineDash([]);
            this.context.lineWidth = 1;
            let xValue = this.offsetLeft;
            chunkedRates.forEach((rates, i) => {
                const firstRate = rates[0];
                const lastRate = rates[rates.length - 1];
                const yValue = CanvasHelper.optimizeCoordinate(((topEnd - firstRate.open) * verticalFactor) + this.offsetTop);
                this.context.moveTo(xValue, yValue);
                this.context.lineTo(xValue + 4, yValue);
                this.context.stroke();

                const yLValue = CanvasHelper.optimizeCoordinate(((topEnd - lastRate.rate) * verticalFactor) + this.offsetTop);
                this.context.moveTo(xValue + 4, yLValue);
                this.context.lineTo(xValue + 6.5, yLValue);
                this.context.stroke();

                const topValue = this.extractTopValue(rates);
                const lowValue = this.extractLowValue(rates);
                const yTopValue = ((topEnd - topValue) * verticalFactor) + this.offsetTop;
                const yLowValue = ((topEnd - lowValue) * verticalFactor) + this.offsetTop;
                const tempXValue = CanvasHelper.optimizeCoordinate(xValue);
                this.context.moveTo(tempXValue + 3, yTopValue);
                this.context.lineTo(tempXValue + 3, yLowValue);
                this.context.stroke();
                xValue += this.stepWidth;
            });
        }
    }


    private chunkRates(): StockRate[][] {
        let chunkedRates = [];
        if (this.rates) {
            let chunk: StockRate[] = [];
            if (this.type === 'monthly') {
                this.rates.forEach((rate, index) => {
                    chunk.push(rate);
                    let nextRate;
                    if (this.rates && typeof this.rates[index + 1] !== undefined) {
                        nextRate = this.rates[index + 1];
                    }
                    if (nextRate && nextRate.date.getDate() < rate.date.getDate()) {
                        chunkedRates.push(chunk);
                        chunk = [];
                    }
                });
                chunkedRates.push(chunk);
            } else if (this.type === 'double-monthly') {
                const relevantMonthIndexes = [0, 2, 4, 6, 8, 10];
                this.rates.forEach((rate, index) => {
                    chunk.push(rate);
                    let nextRate;
                    if (this.rates && typeof this.rates[index + 1] !== undefined) {
                        nextRate = this.rates[index + 1];
                    }
                    if (
                        nextRate && nextRate.date.getDate() < rate.date.getDate()
                        && relevantMonthIndexes.indexOf(nextRate.date.getMonth()) > -1
                    ) {
                        chunkedRates.push(chunk);
                        chunk = [];
                    }
                });
                chunkedRates.push(chunk);
            } else if (this.type === 'weekly') {
                this.rates.forEach((rate, index) => {
                    chunk.push(rate);
                    let nextRate;
                    if (this.rates && typeof this.rates[index + 1] !== undefined) {
                        nextRate = this.rates[index + 1];
                    }
                    if (nextRate && nextRate.date.getDay() < rate.date.getDay()) {
                        chunkedRates.push(chunk);
                        chunk = [];
                    }
                });
                chunkedRates.push(chunk);
            } else {
                let barSpan = 1;
                for (let i = 0; i < this.rates.length; i += barSpan) {
                    chunkedRates.push(this.rates.slice(i, i + barSpan));
                }
            }
        }
        if (screen.width < 400) {
            chunkedRates = chunkedRates.slice(-50);
        } else {
            chunkedRates = chunkedRates.slice(-111);
        }
        // console.log(chunkedRates);

        return chunkedRates;
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
            verticalSteps = 50;
        } else if (delta < 1000) {
            verticalSteps = 100;
        } else if (delta < 2000) {
            verticalSteps = 200;
        } else if (delta < 3000) {
            verticalSteps = 500;
        } else if (delta < 10000) {
            verticalSteps = 1000;
        } else if (delta < 50000) {
            verticalSteps = 5000;
        } else {
            verticalSteps = 10000;
        }

        return verticalSteps;
    }

    private calculateTopEnd(chunkedRates: StockRate[][], targetPrice: number|undefined) {
        let topRate = 0;
        if (targetPrice && targetPrice > 0) {
            topRate = targetPrice;
        }
        chunkedRates.forEach(rates => {
            rates.forEach(entry => {
                if (entry.high > topRate) {
                    topRate = entry.high;
                }
            });
        });

        // console.log('topRate: ' + topRate);
        return topRate;
    }

    private calculateLowEnd(chunkedRates: StockRate[][], stopLoss: number|undefined, targetPrice: number|undefined) {
        let lowRate = 10000000000;
        if (stopLoss && stopLoss > 0) {
            lowRate = stopLoss;
        }
        if (targetPrice && targetPrice > 0) {
            lowRate = targetPrice;
        }
        chunkedRates.forEach(rates => {
            rates.forEach(entry => {
                if (entry.low < lowRate) {
                    lowRate = entry.low;
                }
            });
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
