import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {TranslationService} from "../../services/translation.service";
import {Label} from "../../models/label";
import {DividendDeclaration, NextPayment, Position} from "../../models/position";
import {CrisisDividendSummary, Portfolio} from "../../models/portfolio";
import {ShareheadService} from "../../services/sharehead.service";
import {ShareheadShare} from "../../models/sharehead-share";
import {AnalystRating} from "../../models/analyst-rating";
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
    @Input() ultimateNegation?: boolean;
    @Output() filterUltmateList: EventEmitter<any> = new EventEmitter();

    private availableListingTabs = ['ultimate', 'lastMinute', 'payDays', 'newestRatings', 'nextReports', 'diversification', 'performance', 'strategies', 'crashListings', 'targetValue', 'extraPola'];
    public listingTab = 'ultimate';
    private availablePerformanceTabs = ['1day', '1week', '1month', '3month', '6month', '1year', '3years', '5years', '10years'];
    public performanceListTab = '1day';
    public performanceList?: Position[];
    public payDays?: NextPayment[];
    public declarationDays?: DividendDeclaration[];
    public nextReportsList?: ShareheadShare[];
    public lastMinuteList?: ShareheadShare[];
    public newestRatingsList?: AnalystRating[];
    public ultimateBalance?: number;
    public ultimateTotalReturn?: number;
    public ultimateValue?: number;
    public ultimateShowSingleFilter = false;

    public ultimateColumns?: GridColumn[];
    public ultimateContextMenu?: GridContextMenuItem[];
    public payDaysColumns?: GridColumn[];
    public payDaysContextMenu?: GridContextMenuItem[];
    public declarationDaysColumns?: GridColumn[];
    public declarationDaysContextMenu?: GridContextMenuItem[];

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
        const storedPerformanceTab = localStorage.getItem('performanceTab');
        if (storedPerformanceTab && this.availablePerformanceTabs.indexOf(storedPerformanceTab) > -1) {
            this.changePerformanceListTab(storedPerformanceTab);
        } else {
            this.changePerformanceListTab('1day');
        }
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
            this.shareheadService.getNewestRatingsList(this.portfolio)
                .subscribe(shares => {
                    this.newestRatingsList = shares;
                });

            this.payDays = [];
            for (const position of this.portfolio.getAllPositions()) {
                const nextPayment = position.nextPayment();
                if (nextPayment) {
                    this.payDays.push(nextPayment);
                }
            }
            this.payDays.sort((a,b) => (a.date > b.date) ? 1 : (b.date > a.date) ? -1 : 0);

            this.declarationDays = [];
            for (const position of this.portfolio.getAllPositions()) {
                const plannedDividend = position.shareheadShare?.plannedDividends ? position.shareheadShare?.plannedDividends[0] : undefined;
                if (plannedDividend && plannedDividend.amount === 0 && plannedDividend.declarationDate) {
                    this.declarationDays.push({
                        position: position,
                        positionId: position.id,
                        plannedDividend: plannedDividend
                    });
                }
            }
            this.declarationDays.sort((a,b) => {
                const dataA = a.plannedDividend.declarationDate;
                const dateB = b.plannedDividend.declarationDate;
                return (dataA !== undefined && dateB !== undefined && dataA > dateB) ? 1 : (dataA !== undefined && dateB !== undefined && dateB > dataA) ? -1 : 0;
            });
        }

        this.setUltimateGridOptions();
        this.setPayDaysGridOptions();
        this.setDeclarationDaysGridOptions();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty('ultimateBalanceFilter') && changes['ultimateBalanceFilter'].currentValue instanceof Array) {
            this.ultimateBalanceFilter = changes['ultimateBalanceFilter'].currentValue;
        }
        if (changes.hasOwnProperty('ultimateNegation')) {
            this.ultimateNegation = changes['ultimateNegation'].currentValue;
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
        localStorage.setItem('ultimateFilterLabel', JSON.stringify(this.ultimateBalanceFilter));
        localStorage.setItem('ultimateFilterType', 'label');
        localStorage.setItem('ultimateFilterValue', label.name);
        localStorage.setItem('ultimateNegation', JSON.stringify(this.ultimateNegation));
        this.filterUltmateList.emit(this.ultimateNegation);
    }

    toggleNegation(): void {
        this.ultimateNegation = !this.ultimateNegation;
        localStorage.setItem('ultimateNegation', JSON.stringify(this.ultimateNegation));
        this.filterUltmateList.emit(this.ultimateNegation);
        this.calculateUltimateBalance();
    }

    setThisFilterAsOnlyFilter(label: Label): void {
        this.ultimateShowSingleFilter = true;
        this.ultimateNegation = false;
        this.ultimateBalanceFilter?.forEach(filter => {
            filter.checked = filter.id === label.id;
        });
        localStorage.setItem('ultimateFilterLabel', JSON.stringify(this.ultimateBalanceFilter));
        localStorage.setItem('ultimateFilterType', 'label');
        localStorage.setItem('ultimateFilterValue', label.name);
        localStorage.setItem('ultimateNegation', JSON.stringify(this.ultimateNegation));
        this.filterUltmateList.emit(this.ultimateNegation);
        this.calculateUltimateBalance();
    }

    setAllLabelsActive(): void {
        this.ultimateShowSingleFilter = false;
        this.ultimateNegation = false;
        this.ultimateBalance = undefined;
        this.ultimateTotalReturn = undefined;
        this.ultimateValue = undefined;
        this.ultimateBalanceFilter?.forEach(filter => {
            filter.checked = true;
        });
        localStorage.setItem('ultimateFilterLabel', JSON.stringify(this.ultimateBalanceFilter));
        localStorage.setItem('ultimateFilterType', 'label');
        localStorage.setItem('ultimateFilterValue', '');
        localStorage.setItem('ultimateNegation', JSON.stringify(this.ultimateNegation));
        this.filterUltmateList.emit(this.ultimateNegation);
    }

    changePerformanceListTab(selectedTab: string): void {
        this.performanceListTab = selectedTab;
        localStorage.setItem('performanceTab', selectedTab);
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

    private calculateUltimateBalance(): void
    {
        if (this.ultimateBalanceList) {
            let balance = 0;
            let balanceTotalReturn = 0;
            let value = 0;
            for (const position of this.ultimateBalanceList) {
                if (position.balance && position.visible && position.balance.amount > 0) {
                    const result = +position.actualValue() - position.balance.investment;
                    const totalReturn = +position.actualValue() + position.balance.collectedDividends - position.balance.investment;
                    // console.log(position.share?.name);
                    // console.log(result);
                    balance += result;
                    balanceTotalReturn += totalReturn;
                    value += +position.actualValue();
                }
            }
            this.ultimateBalance = balance;
            this.ultimateTotalReturn = balanceTotalReturn;
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

    private setUltimateGridOptions() {
        this.ultimateColumns = [];
        this.ultimateColumns.push(
            {
                title: this.tranService.trans('GLOB_SHARE'),
                type: 'string',
                field: 'share.name',
            },
            {
                title: 'Sector',
                type: 'string',
                field: 'sector.name',
                responsive: 'md-up',
            },
            {
                title: this.tranService.trans('GLOB_VALUE'),
                type: 'function',
                format: '1.0',
                field: 'actualValue',
                alignment: 'right',
                sortable: true,
            },
            {
                title: 'Labels',
                type: 'renderer',
                field: 'labels',
                responsive: 'sm-up',
                renderer: 'LabelsCellRendererComponent'
            },
            {
                title: '',
                type: 'renderer',
                field: '',
                renderer: 'PricealertsCellRendererComponent',
                width: '55px',
            },
            {
                title: this.tranService.trans('LISTNGS_DAYS'),
                type: 'function',
                format: '1.0',
                field: 'daysSinceStart',
                alignment: 'right',
                sortable: true,
            },
            {
                title: 'Trpd',
                type: 'function',
                field: 'totalReturnPerDay',
                alignment: 'right',
                toolTip: 'Total return per day',
                sortable: true,
                sorted: true
            }
        );

        this.ultimateContextMenu = [];
    }


    private setPayDaysGridOptions() {
        this.payDaysColumns = [];
        this.payDaysColumns.push(
            {
                title: this.tranService.trans('GLOB_SHARE'),
                type: 'string',
                field: 'position.share.name',
            },
            {
                title: 'Account',
                type: 'string',
                field: 'position.bankAccountName',
            },
            {
                title: 'Date',
                type: 'date',
                format: 'dd.MM.yy',
                field: 'date',
            },
            {
                title: '',
                type: 'number',
                format: '1.0-0',
                field: 'paymentCorrected',
                alignment: 'right',
                width: '50px'
            },
            {
                title: '',
                type: 'string',
                field: 'currencyCorrected',
                alignment: 'right',
                width: '35px'
            },
        );

        this.payDaysContextMenu = [];
    }


    private setDeclarationDaysGridOptions() {
        this.declarationDaysColumns = [];
        this.declarationDaysColumns.push(
            {
                title: this.tranService.trans('GLOB_SHARE'),
                type: 'string',
                field: 'position.share.name',
            },
            {
                title: 'Account',
                type: 'string',
                field: 'position.bankAccountName',
            },
            {
                title: 'Date',
                type: 'date',
                format: 'dd.MM.yy',
                field: 'plannedDividend.declarationDate',
            },
        );

        this.declarationDaysContextMenu = [];
    }

}
