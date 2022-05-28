import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Rate} from "../../models/rate";
import {Position} from "../../models/position";


@Component({
    selector: 'app-share-chart',
    templateUrl: './share-chart.component.html',
    styleUrls: ['./share-chart.component.scss']
})
export class ShareChartComponent implements OnInit, AfterViewInit {

    @ViewChild('myCanvas', { static: true }) myCanvas?: ElementRef<HTMLCanvasElement>;

    @Input() rates?: Rate[];
    @Input() position?: Position;

    public canvasWidth = 700;
    public canvasHeight = 300;
    private offsetTop = 10;
    private offsetBottom = 10;
    private offsetLeft = 30;

    private context: any;
    private strokeColor = 'blue';
    private buyColor = 'red';
    private helplineColor = '#dee2e6';
    private textColor = '#4e4e4e';
    private stepWidth = 3;

    constructor() {
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        console.log(this.rates);
        if (this.myCanvas && this.rates) {
            this.context = this.myCanvas.nativeElement.getContext('2d');
            const topRate = this.calculateTopEnd(this.rates);
            const lowRate = this.calculateLowEnd(this.rates);
            const verticalSteps = this.calculateVerticalSteps(topRate, lowRate);
            console.log('vertical-steps: ' + verticalSteps);
            const topEnd = Math.ceil(topRate / verticalSteps) * verticalSteps;
            const lowEnd = Math.floor(lowRate / verticalSteps) * verticalSteps;
            const verticalFactor = (this.canvasHeight - this.offsetTop - this.offsetBottom) / (topEnd - lowEnd);
            console.log(topEnd);
            console.log(lowEnd);
            console.log('factor: ' + verticalFactor);

            this.context.strokeStyle = this.helplineColor;
            this.context.fillStyle = this.textColor;
            this.context.lineWidth = 1;
            let yRate = topEnd;
            do {
                const yValue = ((topEnd - yRate) * verticalFactor) + this.offsetTop;
                this.context.moveTo(this.offsetLeft, yValue);
                this.context.lineTo(this.canvasWidth, yValue);
                this.context.stroke();
                this.context.font = '14px sans-serif';
                this.context.textBaseline = 'middle';
                this.context.direction = 'rtl';
                this.context.fillText(yRate.toString(), 25, yValue);
                yRate -= verticalSteps;
            } while(yRate >= lowEnd);

            if (this.position?.balance) {
                this.context.beginPath();
                this.context.strokeStyle = this.buyColor;
                this.context.setLineDash([5, 5]);
                const buyValue = ((topEnd - this.position?.balance?.averagePayedPriceNet) * verticalFactor) + this.offsetTop;
                console.log('average-price: ' + this.position?.balance?.averagePayedPriceNet);
                console.log('buyValue: ' + buyValue);
                this.context.moveTo(this.offsetLeft, buyValue);
                this.context.lineTo(this.canvasWidth, buyValue);
                this.context.stroke();
            }

            this.context.beginPath();
            this.context.strokeStyle = this.strokeColor;
            this.context.setLineDash([]);
            this.context.lineWidth = 2;
            const firstValue = ((topEnd - this.rates[0].rate) * verticalFactor) + this.offsetTop;
            console.log('firstValue: ' + firstValue);
            this.context.moveTo(this.offsetLeft, firstValue);
            let xValue = this.offsetLeft;
            this.rates.forEach(entry => {
                xValue += this.stepWidth;
                const yValue = ((topEnd - entry.rate) * verticalFactor) + this.offsetTop;
                // console.log(yValue);
                this.context.lineTo(xValue, yValue);
            });
            this.context.stroke();
        }
    }


    private calculateVerticalSteps(topRate: number, lowRate: number)
    {
        let verticalSteps = 50;
        const delta = topRate - lowRate;
        console.log('delta: ' + delta);
        if (delta < 5) {
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

    private calculateTopEnd(rates: Rate[])
    {
        let topRate = 0;
        rates.forEach(entry => {
            if (entry.rate > topRate) {
                topRate = entry.rate;
            }
        });

        console.log('topRate: ' + topRate);
        return topRate;
    }

    private calculateLowEnd(rates: Rate[])
    {
        let lowRate = 10000000000;
        rates.forEach(entry => {
            if (entry.rate < lowRate) {
                lowRate = entry.rate;
            }
        });

        console.log('lowRate: ' + lowRate);
        return lowRate;
    }

}
