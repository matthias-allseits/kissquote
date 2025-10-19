import {Component, Input, OnInit} from '@angular/core';
import {CrisisDividendSummary, LombardValuesSummary, Portfolio} from "../../models/portfolio";
import {PositionCreator} from "../../creators/position-creator";
import {TranslationService} from "../../services/translation.service";
import {GridColumn, GridContextMenuItem} from "../data-grid/data-grid.component";


@Component({
  selector: 'app-crash-listings',
  templateUrl: './crash-listings.component.html',
  styleUrls: ['./crash-listings.component.scss']
})
export class CrashListingsComponent implements OnInit {

    @Input() portfolio?: Portfolio;


    private availableCrashListingTabs = ['lombard', 'crisisDividendProjection', 'risks'];
    public crashListingsTab = 'lombard';
    public lombardValueList?: LombardValuesSummary[];
    public lombardTotal = 0;
    public crisisDividendList?: CrisisDividendSummary[];
    public risksList?: LombardValuesSummary[];
    public riskTotal = 0;
    public missingPositionsInRisklist = 0;
    public crisisDividendTotal = 0;

    public lombardColumns?: GridColumn[];
    public lombardContextMenu?: GridContextMenuItem[];
    public crisisDivisColumns?: GridColumn[];
    public crisisDivisContextMenu?: GridContextMenuItem[];
    public riskColumns?: GridColumn[];
    public riskContextMenu?: GridContextMenuItem[];

    constructor(
        public tranService: TranslationService,
    ) {
    }

    ngOnInit() {
        if (this.portfolio) {
            this.lombardValueList = this.portfolio.lombardValuePositions();
            this.lombardValueList.forEach(entry => {
                this.lombardTotal += +entry.maxDrawdownSummary.lombardValue;
                this.riskTotal += +entry.maxDrawdownSummary.risk;
            });
            this.missingPositionsInRisklist = this.portfolio.getActiveNonCashPositions().length - this.lombardValueList.length;
            this.risksList = structuredClone(this.lombardValueList);
            for (const entry of this.risksList) {
                const posiObject = PositionCreator.oneFromApiArray(entry.position);
                if (posiObject) {
                    entry.position = posiObject;
                }
            }
            this.crisisDividendList = this.portfolio.crisisDividendProjections();
            this.crisisDividendList.forEach(entry => {
                this.crisisDividendTotal += +entry.crisisDropSummary.dividendAfterDrop;
            });
            this.setLombardGridOptions();
            this.setCrisisDivisGridOptions();
            this.setRiskGridOptions();
        }
    }

    changeListingTab(selectedTab: string): void {
        this.crashListingsTab = selectedTab;
        localStorage.setItem('crashListingsTab', selectedTab);
    }

    private setLombardGridOptions() {
        this.lombardColumns = [];
        this.lombardColumns.push(
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
                title: 'Method',
                type: 'string',
                field: 'maxDrawdownSummary.method',
            },
            {
                title: this.tranService.trans('GLOB_VALUE'),
                type: 'number',
                format: '1.0',
                field: 'maxDrawdownSummary.lombardValue',
                alignment: 'right',
                sortable: true,
                sorted: true
            },
            {
                title: 'FrmInv',
                type: 'percent',
                format: '1.0',
                field: 'maxDrawdownSummary.lombardValueFromInvestment',
                alignment: 'right',
                toolTip: this.tranService.trans('LISTNGS_FROM_INVESTMENT'),
                sortable: true,
            }
        );

        this.lombardContextMenu = [];
    }

    private setCrisisDivisGridOptions() {
        this.crisisDivisColumns = [];
        this.crisisDivisColumns.push(
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
                title: 'Data',
                type: 'number',
                format: '1.0',
                field: 'position.shareheadShare.historicDividends.length',
                alignment: 'right',
                responsive: 'md-up',
                sortable: true,
            },
            {
                title: 'Method',
                type: 'string',
                field: 'crisisDropSummary.method',
            },
            {
                title: 'Drop',
                type: 'percent',
                format: '1.0',
                field: 'crisisDropSummary.maxDrop',
                alignment: 'right',
                sortable: true,
            },
            {
                title: 'Actual',
                type: 'number',
                format: '1.0-0',
                field: 'crisisDropSummary.actualDividend',
                alignment: 'right',
                responsive: 'md-up',
                sortable: true,
            },
            {
                title: 'After',
                type: 'number',
                format: '1.0',
                field: 'crisisDropSummary.dividendAfterDrop',
                alignment: 'right',
                sortable: true,
                sorted: true
            }
        );

        this.crisisDivisContextMenu = [];
    }

    private setRiskGridOptions() {
        this.riskColumns = [];
        this.riskColumns.push(
            {
                title: this.tranService.trans('GLOB_SHARE'),
                type: 'string',
                field: 'position.share.name',
            },
            {
                title: 'Sector',
                type: 'string',
                field: 'position.sector.name',
            },
            {
                title: 'Method',
                type: 'string',
                field: 'maxDrawdownSummary.method',
            },
            {
                title: 'Risk',
                type: 'number',
                field: 'maxDrawdownSummary.risk',
                format: '1.0',
                alignment: 'right',
                sortable: true,
                sorted: true
            },
        );

        this.riskContextMenu = [];
    }

}
