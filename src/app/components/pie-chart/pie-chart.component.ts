import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ChartConfiguration, ChartData, ChartEvent, ChartType} from "chart.js";
import {BaseChartDirective} from "ng2-charts";


@Component({
    selector: 'app-pie-chart',
    templateUrl: './pie-chart.component.html',
    styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit {

    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
    @Input() data?: ChartData;
    @Input() height = 191;

    public lineChartType: ChartType = 'pie';
    public lineChartOptions: ChartConfiguration['options'] = {
        plugins: {
            legend: {
                // display: false
            },
        },
    };
    public chartData?: ChartData;

    constructor() {
    }

    ngOnInit(): void {
        console.log();
        if (this.data) {
            this.chartData = this.data;
        }
    }

    // events
    public chartClicked({event, active}: { event?: ChartEvent, active?: {}[] }): void {
        // console.log(event, active);
    }

    public chartHovered({event, active}: { event?: ChartEvent, active?: {}[] }): void {
        // console.log(event, active);
    }

}
