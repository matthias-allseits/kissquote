import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {BaseChartDirective} from "ng2-charts";
import {ChartConfiguration, ChartData, ChartEvent, ChartType} from "chart.js";


@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {

    @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
    @Input() data?: ChartData;
    @Input() height = 300;


    public barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        // We use these empty structures as placeholders for dynamic theming.
        scales: {
            x: {},
            y: {
                min: 10
            }
        },
        plugins: {
            legend: {
                display: false,
            },
        }
    };
    public barChartType: ChartType = 'bar';
    public barChartData?: ChartData;

    constructor() {
    }

    ngOnInit(): void {
        if (this.data) {
            this.barChartData = this.data;
        }
    }

    // events
    public chartClicked({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
        // console.log(event, active);
    }

    public chartHovered({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
        // console.log(event, active);
    }

}
