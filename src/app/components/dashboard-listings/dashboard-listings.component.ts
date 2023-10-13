import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {TranslationService} from "../../services/translation.service";
import {Label} from "../../models/label";
import {NextPayment, Position} from "../../models/position";
import {CrisisDividendSummary, LombardValuesSummary, Portfolio} from "../../models/portfolio";
import {ShareheadService} from "../../services/sharehead.service";
import {ShareheadShare} from "../../models/sharehead-share";
import {ChartData} from "chart.js";
import {AnalystRating} from "../../models/analyst-rating";
import {faEye} from "@fortawesome/free-solid-svg-icons/faEye";
import {GridColumn, GridContextMenuItem} from "../data-grid/data-grid.component";


@Component({
  selector: 'app-dashboard-listings',
  templateUrl: './dashboard-listings.component.html',
  styleUrls: ['./dashboard-listings.component.scss']
})
export class DashboardListingsComponent implements OnInit, OnChanges {

    @Input() portfolio?: Portfolio;
    @Input() ultimateBalanceList?: Position[];
    @Input() ultimateBalanceFilter?: Label[];
    @Output() filterUltmateList: EventEmitter<any> = new EventEmitter();

    eyeIcon = faEye;

    private availableListingTabs = ['ultimate', 'lombard', 'crisisDividendProjection', 'lastMinute', 'payDays', 'newestRatings', 'nextReports', 'diversification', 'performance', 'risks', 'strategies', 'targetValue'];
    public listingTab = 'ultimate';
    private availablePerformanceTabs = ['1day', '1week', '1month', '3month', '6month', '1year', '3years', '5years', '10years'];
    public performanceListTab = '1day';
    public performanceList?: Position[];
    public payDays?: NextPayment[];
    public nextReportsList?: ShareheadShare[];
    public diversityByInvestmentChartData?: ChartData;
    public diversityByValueChartData?: ChartData;
    public diversityByDividendChartData?: ChartData;
    public strategiesByInvestmentChartData?: ChartData;
    public strategiesByValueChartData?: ChartData;
    public strategiesByDividendChartData?: ChartData;
    public lastMinuteList?: ShareheadShare[];
    public newestRatingsList?: AnalystRating[];
    public crisisDividendList?: CrisisDividendSummary[];
    public crisisDividendTotal = 0;
    public lombardValueList?: LombardValuesSummary[];
    public lombardTotal = 0;
    public risksList?: LombardValuesSummary[];
    public riskTotal = 0;
    public diversityListTitle = '';
    public diversityList: Position[] = [];
    public ultimateBalance?: number;
    public ultimateValue?: number;

    public lombardColumns?: GridColumn[];
    public lombardContextMenu?: GridContextMenuItem[];
    public crisisDivisColumns?: GridColumn[];
    public crisisDivisContextMenu?: GridContextMenuItem[];

    constructor(
        public tranService: TranslationService,
        private shareheadService: ShareheadService,
    ) {
    }

    ngOnInit() {
        const storedListingTab = localStorage.getItem('listingTab');
        if (storedListingTab && this.availableListingTabs.indexOf(storedListingTab) > -1) {
            this.listingTab = storedListingTab;
        } else {
            this.listingTab = 'ultimate';
        }
        this.changePerformanceListTab('1day');
        if (this.portfolio) {
            this.shareheadService.getLastMinuteList()
                .subscribe(shares => {
                    this.lastMinuteList = shares;
                    this.markSharesOnList(this.lastMinuteList, this.portfolio);
                });
            this.shareheadService.getNextReportsList(this.portfolio)
                .subscribe(shares => {
                    this.nextReportsList = shares;
                });
            this.diversityByInvestmentChartData = this.portfolio.diversityByInvestmentChartData();
            this.diversityByValueChartData = this.portfolio.diversityByValueChartData();
            this.diversityByDividendChartData = this.portfolio.diversityByDividendChartData();
            this.strategiesByInvestmentChartData = this.portfolio.strategiesByInvestmentChartData();
            this.strategiesByValueChartData = this.portfolio.strategiesByValueChartData();
            this.strategiesByDividendChartData = this.portfolio.strategiesByDividendChartData();
            this.shareheadService.getNewestRatingsList(this.portfolio)
                .subscribe(shares => {
                    this.newestRatingsList = shares;
                });
            this.crisisDividendList = this.portfolio.crisisDividendProjections();
            this.crisisDividendList.forEach(entry => {
                this.crisisDividendTotal += +entry.crisisDropSummary.dividendAfterDrop;
            });
            this.lombardValueList = this.portfolio.lombardValuePositions();
            this.lombardValueList.forEach(entry => {
                this.lombardTotal += +entry.maxDrawdownSummary.lombardValue;
                this.riskTotal += +entry.maxDrawdownSummary.risk;
            });
            this.risksList = structuredClone(this.lombardValueList);
            this.risksList.sort((a,b) => (a.maxDrawdownSummary.risk < b.maxDrawdownSummary.risk) ? 1 : (b.maxDrawdownSummary.risk < a.maxDrawdownSummary.risk) ? -1 : 0);

            this.payDays = [];
            for (const position of this.portfolio.getAllPositions()) {
                const nextPayment = position.nextPayment();
                if (nextPayment) {
                    this.payDays.push(nextPayment);
                }
            }
            this.payDays.sort((a,b) => (a.date > b.date) ? 1 : (b.date > a.date) ? -1 : 0);
        }

        this.setLombardGridOptions();
        this.setCrisisDivisGridOptions();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty('ultimateBalanceFilter') && changes['ultimateBalanceFilter'].currentValue instanceof Array) {
            this.ultimateBalanceFilter = changes['ultimateBalanceFilter'].currentValue;
        }
    }

    changeListingTab(selectedTab: string): void {
        this.listingTab = selectedTab;
        localStorage.setItem('listingTab', selectedTab);
    }

    toggleUltimateBalanceFilter(label: Label): void {
        this.ultimateBalanceFilter?.forEach(filter => {
            if (filter.id === label.id) {
                filter.checked = !filter.checked;
            }
        });
        localStorage.setItem('ultimateFilter', JSON.stringify(this.ultimateBalanceFilter));
        this.filterUltmateList.emit();
    }

    setThisFilterAsOnlyFilter(label: Label): void {
        this.ultimateBalanceFilter?.forEach(filter => {
            if (filter.id === label.id) {
                filter.checked = true;
            } else {
                filter.checked = false;
            }
        });
        localStorage.setItem('ultimateFilter', JSON.stringify(this.ultimateBalanceFilter));
        this.filterUltmateList.emit();
        this.calculateUltimateBalance();
    }

    setAllLabelsActive(): void {
        this.ultimateBalance = undefined;
        this.ultimateValue = undefined;
        this.ultimateBalanceFilter?.forEach(filter => {
            filter.checked = true;
        });
        localStorage.setItem('ultimateFilter', JSON.stringify(this.ultimateBalanceFilter));
        this.filterUltmateList.emit();
    }

    changePerformanceListTab(selectedTab: string): void {
        this.performanceListTab = selectedTab;
        this.performanceList = [];
        const tabIndex = this.availablePerformanceTabs.indexOf(selectedTab);
        this.portfolio?.getActiveNonCashPositions().forEach(position => {
            position.tempPerformanceValue = position.balance?.performance[tabIndex];
            if (this.performanceList && position.tempPerformanceValue !== undefined) {
                this.performanceList.push(position);
            }
        });
        this.performanceList.sort((a, b) => (a.tempPerformanceValue !== undefined && b.tempPerformanceValue !== undefined && a.tempPerformanceValue < b.tempPerformanceValue) ? 1 : ((a.tempPerformanceValue !== undefined && b.tempPerformanceValue !== undefined && b.tempPerformanceValue < a.tempPerformanceValue) ? -1 : 0));
    }

    listDiversityPositions(event: any): void {
        console.log(event);
        this.diversityList = [];
        this.diversityListTitle = event;
        this.portfolio?.getActiveNonCashPositions().forEach(position => {
                if (position.sector?.name === event) {
                    this.diversityList.push(position);
                }
            });
    }

    private calculateUltimateBalance(): void
    {
        if (this.ultimateBalanceList) {
            let balance = 0;
            let value = 0;
            for (const position of this.ultimateBalanceList) {
                if (position.balance && position.visible) {
                    const result = +position.actualValue() - position.balance.investment;
                    balance += result;
                    value += +position.actualValue();
                }
            }
            this.ultimateBalance = balance;
            this.ultimateValue = value;
        }
    }

    private markSharesOnList(shareList: ShareheadShare[], portfolio?: Portfolio): void
    {
        if (portfolio) {
            shareList.forEach(shareheadShare => {
                portfolio.bankAccounts.forEach(account => {
                    account.getActiveNonCashPositions().forEach(position => {
                        if (position.shareheadId === shareheadShare.id) {
                            shareheadShare.positionId = position.id;
                        }
                    });
                });
                portfolio.watchlistEntries.forEach(entry => {
                    if (entry.shareheadId === shareheadShare.id) {
                        shareheadShare.isOnWatchlist = true;
                    }
                });
            });
        }
    }


    selectPosition(position: Position) {
    }

    positionEventHandler(event: any) {
        switch(event.key) {
        }
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
            },
            {
                title: 'FrmInv',
                type: 'percent',
                format: '1.0',
                field: 'maxDrawdownSummary.lombardValueFromInvestment',
                alignment: 'right',
                toolTip: this.tranService.trans('LISTNGS_FROM_INVESTMENT'),
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
            },
            {
                title: 'Actual',
                type: 'number',
                format: '1.0-0',
                field: 'crisisDropSummary.actualDividend',
                alignment: 'right',
                responsive: 'md-up',
            },
            {
                title: 'After',
                type: 'number',
                format: '1.0',
                field: 'crisisDropSummary.dividendAfterDrop',
                alignment: 'right',
            }
        );

        this.crisisDivisContextMenu = [];
    }


}
