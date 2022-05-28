import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Rate} from "../../models/rate";


@Component({
    selector: 'app-share-chart',
    templateUrl: './share-chart.component.html',
    styleUrls: ['./share-chart.component.scss']
})
export class ShareChartComponent implements OnInit, AfterViewInit {

    @ViewChild('myCanvas', { static: true }) myCanvas?: ElementRef<HTMLCanvasElement>;

    @Input() rates?: Rate[];

    public canvasWidth = 680;
    public canvasHeight = 200;

    private context: any;
    private color = 'red';
    private stepWidth = 10;

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
            const topEnd = Math.ceil(topRate / verticalSteps) * verticalSteps;
            const lowEnd = Math.floor(lowRate / verticalSteps) * verticalSteps;
            const verticalFactor = this.canvasHeight / (topEnd - lowEnd);
            console.log(topEnd);
            console.log(lowEnd);
            console.log('factor: ' + verticalFactor);

            this.context.fillStyle = this.color;
            const firstValue = (topEnd - this.rates[0].rate) * verticalFactor;
            console.log('firstValue: ' + firstValue);
            this.context.moveTo(0, firstValue);
            let xValue = 0;
            this.rates.forEach(entry => {
                xValue += this.stepWidth;
                const yValue = (topEnd - entry.rate) * verticalFactor;
                // console.log(yValue);
                this.context.lineTo(xValue, yValue);
            });
            this.context.stroke();
        }
    }


    private calculateVerticalSteps(topRate: number, lowRate: number)
    {
        let verticalSteps = 10;
        const delta = topRate - lowRate;
        console.log('delta: ' + delta);
        if (delta < 10) {
            verticalSteps = 1;
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
