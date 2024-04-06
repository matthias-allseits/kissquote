import {Component, Input} from '@angular/core';
import {Portfolio} from "../../models/portfolio";
import {GridColumn, GridContextMenuItem} from "../data-grid/data-grid.component";
import {TranslationService} from "../../services/translation.service";
import {Position} from "../../models/position";


export interface ExtraPolaSummary {
    position: Position;
    actual: number;
    avgPerformance: number;
    extraPolatedValue: number;
    extraPolatedPrice: number;
    performance: number;
    method: string;
}

@Component({
  selector: 'app-extrapolation-list',
  templateUrl: './extrapolation-list.component.html',
  styleUrls: ['./extrapolation-list.component.scss']
})
export class ExtrapolationListComponent {

    @Input() portfolio?: Portfolio;

    public extraPolaList: ExtraPolaSummary[] = [];
    public year = new Date().getFullYear();
    public actualTotal = 0;
    public extraPolatedTotal = 0;
    public globalPerformance = 0;

    public tableColumns?: GridColumn[];
    public tableContextMenu?: GridContextMenuItem[];

    constructor(
        public tranService: TranslationService,
    ) {}

    ngOnInit() {
        this.year += 5;
        this.prepareData();
        this.setTableGridOptions();
    }


    prepareData() {
        this.extraPolaList = [];
        this.actualTotal = 0;
        this.extraPolatedTotal = 0;
        this.globalPerformance = 0;
        this.portfolio?.getActiveNonCashPositions().forEach(position => {
            const extraPolaSummary = position.getExtraPolaSummary();
            this.actualTotal += extraPolaSummary.actual;
            this.extraPolatedTotal += extraPolaSummary.extraPolatedValue;
            this.extraPolaList.push(extraPolaSummary);
        });
        this.globalPerformance = +((100 / this.actualTotal * this.extraPolatedTotal) - 100).toFixed();
        this.extraPolaList.sort((a, b) => (+a.extraPolatedValue < +b.extraPolatedValue) ? 1 : ((+b.extraPolatedValue < +a.extraPolatedValue) ? -1 : 0));
    }


    private setTableGridOptions() {
        this.tableColumns = [];
        this.tableColumns.push(
            {
                title: this.tranService.trans('GLOB_SHARE'),
                type: 'string',
                field: 'position.share.name',
            },
            {
                title: 'Sector',
                type: 'string',
                field: 'position.sector.name',
                responsive: 'md-up',
            },
            {
                title: 'Actual',
                type: 'number',
                field: 'actual',
                format: '1.0',
                alignment: 'right',
                responsive: 'sm-up',
            },
            {
                title: 'XtraPltd',
                type: 'number',
                field: 'extraPolatedValue',
                toolTip: 'Extrapolated value',
                format: '1.0',
                alignment: 'right',
            },
            {
                title: 'Method',
                type: 'string',
                field: 'method',
                responsive: 'md-up',
            },
            {
                title: 'AvgPrfmce',
                type: 'percent',
                field: 'avgPerformance',
                toolTip: 'Average from Sharehead',
                responsive: 'md-up',
                alignment: 'right',
            },
            {
                title: 'XPltdPrice',
                type: 'number',
                format: '1.0-2',
                field: 'extraPolatedPrice',
                alignment: 'right',
                toolTip: 'Extrapolated price',
                responsive: 'md-up',
            },
            {
                title: 'Prfmce',
                type: 'percent',
                format: '1.0',
                field: 'performance',
                toolTip: 'Performance till ' + this.year,
                alignment: 'right',
            }
        );

        this.tableContextMenu = [];
    }
}
