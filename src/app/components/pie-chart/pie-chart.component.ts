import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
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
    @Output() triggerClick: EventEmitter<any> = new EventEmitter();

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

    public chartClicked({event, active}: { event?: any, active?: {}[] }): void {
        let clickedName = event.chart.tooltip.title[0];
        clickedName = clickedName.substring(0, clickedName.lastIndexOf(' '));
        this.triggerClick.next(clickedName);
    }

    public chartHovered({event, active}: { event?: ChartEvent, active?: {}[] }): void {
        // console.log(event, active);
    }

}
