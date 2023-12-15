import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {TranslationService} from "../../services/translation.service";
import {Portfolio} from "../../models/portfolio";
import {ChartData} from "chart.js";
import {Position} from "../../models/position";
import {GridColumn, GridContextMenuItem} from "../data-grid/data-grid.component";


@Component({
  selector: 'app-diversification-sector',
  templateUrl: './diversification-sector.component.html',
  styleUrls: ['./diversification-sector.component.scss']
})
export class DiversificationSectorComponent implements OnInit, OnChanges {

    @Input() portfolio?: Portfolio;
    @Input() timeWarpMode?: boolean;
    @Input() componentTitle?: string;

    public diversityByInvestmentChartData?: ChartData;
    public diversityByValueChartData?: ChartData;
    public diversityByDividendChartData?: ChartData;
    public diversificationColumns?: GridColumn[];
    public diversificationContextMenu?: GridContextMenuItem[];
    public diversityListTitle = '';
    public diversityList: Position[] = [];

    constructor(
        public tranService: TranslationService,
    ) {
    }

    ngOnInit() {
        this.setDiversificationGridOptions();
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(this.portfolio);
        this.loadData();
    }

    loadData() {
        if (this.portfolio) {
            this.diversityByInvestmentChartData = this.portfolio.diversityByInvestmentChartData();
            this.diversityByValueChartData = this.portfolio.diversityByValueChartData();
            this.diversityByDividendChartData = this.portfolio.diversityByDividendChartData();
        }
    }

    listDiversityPositions(event: any): void {
        this.diversityList = [];
        this.diversityListTitle = event;
        const filteredIds: number[] = [];
        this.portfolio?.getActiveNonCashPositions().forEach(position => {
            console.log(position);
            if (position.sector?.name === event) {
                this.diversityList.push(position);
                filteredIds.push(position.id);
            }
        });
        this.diversityList.sort((a, b) => (+a.totalReturnPerDay() < +b.totalReturnPerDay()) ? 1 : ((+b.totalReturnPerDay() < +a.totalReturnPerDay()) ? -1 : 0));
        localStorage.setItem('ultimateFilterSector', JSON.stringify(filteredIds));
        localStorage.setItem('ultimateFilterType', 'sector');
    }


    selectPosition(position: Position) {
    }

    positionEventHandler(event: any) {
        switch(event.key) {
        }
    }

    private setDiversificationGridOptions() {
        this.diversificationColumns = [];
        this.diversificationColumns.push(
            {
                title: this.tranService.trans('GLOB_SHARE'),
                type: 'string',
                field: 'share.name',
            },
            {
                title: 'Labels',
                type: 'renderer',
                field: 'labels',
                responsive: 'md-up',
                renderer: 'LabelsCellRendererComponent'
            },
            {
                title: 'Investment',
                type: 'number',
                format: '1.0',
                field: 'balance.investment',
                alignment: 'right',
                responsive: 'md-up',
            },
            {
                title: this.tranService.trans('GLOB_VALUE'),
                type: 'function',
                format: '1.0',
                field: 'actualValue',
                alignment: 'right',
                responsive: 'sm-up',
            },
            {
                title: 'Dividend',
                type: 'function',
                format: '1.0',
                field: 'bestSelectedDividendPayment',
                alignment: 'right',
            },
            {
                title: this.tranService.trans('GLOB_CURRENCY'),
                type: 'string',
                field: 'currency.name',
            },
            {
                title: this.tranService.trans('LISTNGS_DAYS'),
                type: 'function',
                format: '1.0',
                field: 'daysSinceStart',
                alignment: 'right',
                responsive: 'sm-up',
            },
            {
                title: 'Trpd',
                type: 'function',
                field: 'totalReturnPerDay',
                alignment: 'right',
                toolTip: 'Total return per day',
                responsive: 'sm-up',
            }
        );

        this.diversificationContextMenu = [];
    }

}
