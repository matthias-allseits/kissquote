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
    @Input() timeWarpDate?: Date|undefined;
    @Input() componentTitle?: string;

    public diversityByInvestmentChartData?: ChartData;
    public diversityByValueChartData?: ChartData;
    public diversityByDividendChartData?: ChartData;
    public diversityByRelevanceChartData?: ChartData;
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
        this.loadData();
    }

    loadData() {
        if (this.portfolio) {
            this.diversityByInvestmentChartData = this.portfolio.diversityByInvestmentChartData();
            this.diversityByValueChartData = this.portfolio.diversityByValueChartData();
            this.diversityByDividendChartData = this.portfolio.diversityByDividendChartData();
            this.diversityByRelevanceChartData = this.portfolio.diversityByRelevanceChartData();
        }
    }

    listDiversityPositions(event: any): void {
        console.log(event);
        this.diversityList = [];
        this.diversityListTitle = event;
        const filteredIds: number[] = [];
        const relevanceLabels = ['Relevant', 'Irrelevant'];
        this.portfolio?.getActiveNonCashPositions().forEach(position => {
            if (relevanceLabels.indexOf(event) === -1) {
                if (position.sector?.name === event) {
                    if (this.timeWarpMode) {
                        position.timeWarpDate = this.timeWarpDate;
                    }
                    this.diversityList.push(position);
                    filteredIds.push(position.id);
                }
            } else {
                if (position.isRelevant() && event === 'Relevant') {
                    this.diversityList.push(position);
                    filteredIds.push(position.id);
                } else if (!position.isRelevant() && event === 'Irrelevant') {
                    this.diversityList.push(position);
                    filteredIds.push(position.id);
                }
            }
        });
        if (!this.timeWarpMode) {
            this.diversityList.sort((a, b) => (+a.totalReturnPerDay() < +b.totalReturnPerDay()) ? 1 : ((+b.totalReturnPerDay() < +a.totalReturnPerDay()) ? -1 : 0));
        } else {
            this.diversityList.sort((a, b) => (+a.activeFrom > +b.activeFrom) ? 1 : ((+b.activeFrom > +a.activeFrom) ? -1 : 0));
        }
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
                sortable: true
            },
            {
                title: this.tranService.trans('GLOB_VALUE'),
                type: 'function',
                format: '1.0',
                field: 'actualValue',
                alignment: 'right',
                responsive: 'sm-up',
                sortable: true
            },
            {
                title: 'Dividend',
                type: 'function',
                format: '1.0',
                field: 'bestSelectedDividendPayment',
                alignment: 'right',
                sortable: true
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
                sortable: true
            },
            {
                title: 'Trpd',
                type: 'function',
                field: 'totalReturnPerDay',
                alignment: 'right',
                toolTip: 'Total return per day',
                responsive: 'sm-up',
                sortable: true,
                sorted: true
            }
        );

        if (this.timeWarpMode) {
            this.diversificationColumns.splice(1, 1);
        }

        this.diversificationContextMenu = [];
    }

}
