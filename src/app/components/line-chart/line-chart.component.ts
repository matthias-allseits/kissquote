import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ChartConfiguration, ChartData, ChartEvent, ChartType} from "chart.js";
import {BaseChartDirective} from "ng2-charts";


@Component({
    selector: 'app-line-chart',
    templateUrl: './line-chart.component.html',
    styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit {

    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
    @Input() data?: ChartData;
    @Input() height = 141;
    // @Input() beginAtZero = false;
    @Input() forceBeginAtZero = false;
    @Input() percentageChart = false;
    @Input() pointRadius?: number;

    public lineChartType: ChartType = 'line';
    public lineChartOptions: ChartConfiguration['options'] = {
        elements: {
            line: {
                // tension: 0.5
            },
            point: {
                radius: 0,
            }
        },
        scales: {
            // We use this empty structure as a placeholder for dynamic theming.
            x: {},
            y: {
                min: undefined,
                grid: {
                    // drawBorder: false,
                    color: function(context) {
                        if (context.tick.value === 0) {
                            return '#000000';
                        } else {
                            return 'rgb(201, 203, 207)';
                        }
                    },
                },
            },
            // 'y-axis-0': {
            //     // position: 'left',
            //     beginAtZero: this.beginAtZero
            // },
        },
        plugins: {
            legend: {
                display: false
            },
        },
    };
    public lineChartData?: ChartData;

    constructor() {
    }

    ngOnInit(): void {
        if (this.data) {
            this.lineChartData = this.data;
        }
        if (this.forceBeginAtZero) {
            if (this.lineChartOptions && this.lineChartOptions.scales && this.lineChartOptions.scales['y']) {
                this.lineChartOptions.scales['y'].min = 0;
            }
        }
        if (this.percentageChart) {
            if (this.lineChartOptions && this.lineChartOptions.scales && this.lineChartOptions.scales['y']) {
                this.lineChartOptions.scales['y'].max = 100;
            }
        }
        if (this.pointRadius) {
            if (this.lineChartOptions && this.lineChartOptions.elements && this.lineChartOptions.elements.point) {
                this.lineChartOptions.elements.point.radius = this.pointRadius;
            }
        }
    }

    updateData(data: ChartData): void {
        console.log('let us update data');
        console.log(data);
        this.data = data;
        if (this.chart) {
            this.chart.update();
        }
    }

    // events
    public chartClicked({event, active}: { event?: ChartEvent, active?: {}[] }): void {
        // console.log(event, active);
    }

    public chartHovered({event, active}: { event?: any, active?: {}[] }): void {
        // console.log(event);
        // console.log(event.chart);
        // console.log('height: ', event.chart.tooltip.height);
        const dataPoints = event.chart.tooltip.dataPoints;
        if (dataPoints) {
            // console.log('dataPoints: ', dataPoints);
            const pointValue = event.chart.tooltip.dataPoints[0].raw;
            // console.log('pointValue: ', pointValue);
            // console.log(event.chart.tooltip.dataPoints[0].dataset.data);
            const dataIndex = event.chart.tooltip.dataPoints[0].dataset.data.lastIndexOf(pointValue);
            // console.log('dataIndex: ', dataIndex);
            if (dataIndex > 0) {
                const pointValueBefore = event.chart.tooltip.dataPoints[0].dataset.data[dataIndex - 1];
                const changeInPercent = +((100 / pointValueBefore * pointValue) - 100).toFixed(1);
                // console.log('changeInPercent: ', changeInPercent);
                const existingText = event.chart.tooltip.body[0].lines[0];
                if (existingText.indexOf('%') === -1) {
                    event.chart.tooltip.body[0].lines[0] += ' (' + changeInPercent + '%)';
                }
                // event.chart.tooltip.body[0].lines[1] = changeInPercent + '%';
                // event.chart.tooltip.height = 63;
            }
        }
    }

}
