import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {BaseChartDirective} from "ng2-charts";
import {ChartConfiguration, ChartData, ChartEvent, ChartType} from "chart.js";


@Component({
    selector: 'app-stacked-bar-chart',
    templateUrl: './stacked-bar-chart.component.html',
    styleUrls: ['./stacked-bar-chart.component.scss']
})
export class StackedBarChartComponent implements OnInit, OnChanges {

    @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
    @Input() data?: ChartData;
    @Input() height = 300;
    @Input() stacked = false;

    public barChartType: ChartType = 'bar';
    public barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        // We use these empty structures as placeholders for dynamic theming.
        scales: {
            x: {
                stacked: true
            },
            y: {
                stacked: true,
                min: 0
            }
        },
        plugins: {
            legend: {
                display: false,
            },
        }
    };
    public barChartData?: ChartData;

    constructor() {
    }

    ngOnInit(): void {
        if (this.data) {
            this.barChartData = this.data;
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.barChartData = changes['data'].currentValue;
    }

    // events
    public chartClicked({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
        // console.log(event, active);
    }

    public chartHovered({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
        // console.log(event, active);
    }

}
