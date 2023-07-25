import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {TranslationService} from "../../services/translation.service";
import {Label} from "../../models/label";
import {Position} from "../../models/position";
import {CrisisDividendSummary, LombardValuesSummary, Portfolio} from "../../models/portfolio";
import {ShareheadService} from "../../services/sharehead.service";
import {ShareheadShare} from "../../models/sharehead-share";
import {ChartData} from "chart.js";
import {AnalystRating} from "../../models/analyst-rating";
import {faEye} from "@fortawesome/free-solid-svg-icons/faEye";


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

    private availableListingTabs = ['ultimate', 'lombard', 'crisisDividendProjection', 'lastMinute', 'newestRatings', 'nextReports', 'diversification', 'performance', 'risks'];
    public listingTab = 'ultimate';
    private availablePerformanceTabs = ['1day', '1week', '1month', '3month', '6month', '1year', '3years', '5years', '10years'];
    public performanceListTab = '1day';
    public performanceList?: Position[];
    public nextReportsList?: ShareheadShare[];
    public diversityByInvestmentChartData?: ChartData;
    public diversityByValueChartData?: ChartData;
    public diversityByDividendChartData?: ChartData;
    public lastMinuteList?: ShareheadShare[];
    public newestRatingsList?: AnalystRating[];
    public crisisDividendList?: CrisisDividendSummary[];
    public crisisDividendTotal = 0;
    public lombardValueList?: LombardValuesSummary[];
    public lombardTotal = 0;
    public risksList?: LombardValuesSummary[];
    public riskTotal = 0;

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
        }
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
    }

    setAllLabelsActive(): void {
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
            if (this.performanceList && position.tempPerformanceValue) {
                this.performanceList.push(position);
            }
        });
        this.performanceList.sort((a, b) => (a.tempPerformanceValue !== undefined && b.tempPerformanceValue !== undefined && a.tempPerformanceValue < b.tempPerformanceValue) ? 1 : ((a.tempPerformanceValue !== undefined && b.tempPerformanceValue !== undefined && b.tempPerformanceValue < a.tempPerformanceValue) ? -1 : 0));
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

}
