import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {DividendTotals, Portfolio} from '../../models/portfolio';
import {faEdit, faListCheck, faPlus, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {faEye} from "@fortawesome/free-solid-svg-icons/faEye";
import {TranslationService} from "../../services/translation.service";
import {DividendTotal, Position} from "../../models/position";
import {PositionService} from "../../services/position.service";
import {BankAccount} from "../../models/bank-account";
import {BankAccountService} from "../../services/bank-account.service";
import {FormGroup, UntypedFormControl, Validators} from "@angular/forms";
import {ShareheadService} from "../../services/sharehead.service";
import {WatchlistEntry} from "../../models/watchlistEntry";
import {ShareheadShare} from "../../models/sharehead-share";
import {WatchlistService} from "../../services/watchlist.service";
import {ManualDividend} from "../../models/manual-dividend";
import {ManualDividendService} from "../../services/manual-dividend.service";
import {DividendCreator} from "../../creators/dividend-creator";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {Label} from "../../models/label";
import {LabelService} from "../../services/label.service";
import {ActivatedRoute, Router} from "@angular/router";
import {faEllipsisVertical} from "@fortawesome/free-solid-svg-icons/faEllipsisVertical";
import {GridColumn, GridContextMenuItem} from "../../components/data-grid/data-grid.component";
import {ShareCreator} from "../../creators/share-creator";


@Component({
    selector: 'app-my-dashboard',
    templateUrl: './my-dashboard.component.html',
    styleUrls: ['./my-dashboard.component.scss']
})
export class MyDashboardComponent implements OnInit {

    @ViewChild('removePositionModal') removeModal?: TemplateRef<any>;

    protected readonly eyeIcon = faEye;
    protected readonly deleteIcon = faTrashAlt;
    protected readonly addIcon = faPlus;
    protected readonly editIcon = faEdit;
    protected readonly naviIcon = faEllipsisVertical;
    protected readonly listIcon = faListCheck;

    public myKey: string|null = null;
    // todo: the portfolio has to be ready at this time. probably the solution: resolvers!
    public portfolio: Portfolio|null = null;
    public labels?: Label[];
    public nonCashPositions: any[] = [];
    private selectedPosition?: Position;
    private selectedBankAccount?: BankAccount;
    public selectedWatchlistEntry?: WatchlistEntry;
    public selectedManualDividend?: ManualDividend;
    private availableDashboardTabs = ['balance', 'logbook', 'dividends', 'watchlist', 'settings', 'closedPositions', 'listings'];
    public dashboardTab = '0';
    public dividendListTab = new Date().getFullYear();
    public dividendLists?: DividendTotals[];
    public closedPositionsBalance = 0;
    public years = [2023, 2024, 2025, 2026, 2027, 2028, 2029];
    public ultimateBalanceList?: Position[];
    public ultimateBalanceFilter?: Label[];
    public shareheadSharesLoaded = false;
    private positionListForBalance: Position[] = [];
    public balanceResult = 0;
    public selectionBalance = false;
    modalRef?: NgbModalRef;

    public cashColumns?: GridColumn[];
    public cashContextMenu?: GridContextMenuItem[];
    public nonCashColumns?: GridColumn[];
    public nonCashContextMenu?: GridContextMenuItem[];
    public closedColumns?: GridColumn[];
    public closedContextMenu?: GridContextMenuItem[];

    manualDividendForm = new FormGroup({
        year: new UntypedFormControl(new Date().getFullYear(), Validators.required),
        amount: new UntypedFormControl('', Validators.required),
    });

    constructor(
        public tranService: TranslationService,
        private route: ActivatedRoute,
        private router: Router,
        private positionService: PositionService,
        private labelService: LabelService,
        private bankAccountService: BankAccountService,
        private modalService: NgbModal,
        private shareheadService: ShareheadService,
        private watchlistService: WatchlistService,
        private manualDividendService: ManualDividendService,
    ) {
    }

    ngOnInit(): void {
        this.route.data.subscribe(data => {
            if (data['portfolio'] instanceof Portfolio) {
                this.portfolio = data['portfolio'];
                this.shareheadSharesLoaded = true;
                if (this.portfolio) {
                    this.dividendLists = this.portfolio.collectDividendLists();
                }
                this.portfolio.bankAccounts.forEach((account, index) => {
                    this.availableDashboardTabs.push(index.toString());
                    this.nonCashPositions.push({
                        positions: account.getActiveNonCashPositions()
                    });
                });
                const storedTab = localStorage.getItem('dashboardTab');
                if (storedTab && this.availableDashboardTabs.indexOf(storedTab) > -1) {
                    this.dashboardTab = storedTab;
                } else {
                    this.dashboardTab = '0';
                }
                this.ultimateBalanceList = this.portfolio.getActiveNonCashPositions();
                this.ultimateBalanceList.sort((a, b) => (+a.totalReturnPerDay() < +b.totalReturnPerDay()) ? 1 : ((+b.totalReturnPerDay() < +a.totalReturnPerDay()) ? -1 : 0));
                this.getAllLabels();
                this.portfolio.getClosedNonCashPositions().forEach(position => {
                    if (position.balance?.closedResult) {
                        this.closedPositionsBalance += +position.closedResultCorrected();
                    }
                });
                this.loadWatchlist();
                this.setCashGridOptions();
                this.setNonCashGridOptions();
                this.setClosedGridOptions();
            }
        });
    }

    changeTab(selectedTab: string): void {
        this.dashboardTab = selectedTab;
        localStorage.setItem('dashboardTab', selectedTab);
        this.selectionBalance = false;
        this.positionListForBalance = [];
    }

    selectPosition(position: Position) {
        this.selectedPosition = position;
    }

    togglePositionForBalance(position: Position) {
        const check = this.positionListForBalance.indexOf(position);
        if (check > -1) {
            this.positionListForBalance.splice(check, 1);
        } else {
            this.positionListForBalance.push(position);
        }
        this.balanceResult = 0;
        for (const posi of this.positionListForBalance) {
            if (posi.balance?.closedResult) {
                this.balanceResult += +posi.closedResultCorrected();
            }
        }
    }

    changeDividenListTab(selectedTab: number): void {
        this.dividendListTab = selectedTab;
    }

    openPositionConfirmModal(template: TemplateRef<any>, position: Position) {
        this.selectedPosition = position;
        this.modalRef = this.modalService.open(template);
    }

    openWatchlistConfirmModal(template: TemplateRef<any>, entry: WatchlistEntry) {
        this.selectedWatchlistEntry = entry;
        this.modalRef = this.modalService.open(template);
    }


    confirmDeletePosition(): void {
        if (this.selectedPosition) {
            this.deletePosition(this.selectedPosition);
        }
        this.modalRef?.close();
    }

    cancelModal(): void {
        this.modalRef?.close();
    }

    deletePosition(position: Position): void {
        this.positionService.delete(position.id).subscribe(() => {
            // todo: implement a data updater
            document.location.reload();
        });
    }

    openAccountConfirmModal(template: TemplateRef<any>, account: BankAccount) {
        this.selectedBankAccount = account;
        this.modalRef = this.modalService.open(template);
    }

    openManualDividendModal(template: TemplateRef<any>, entry: DividendTotal, year: number) {
        console.log(entry);
        const position = this.portfolio?.positionById(entry.positionId);
        console.log(position);
        if (position) {
            if (entry.manualDividend === undefined) {
                this.selectedManualDividend = DividendCreator.createNewDividend();
                this.selectedManualDividend.share = position.share;
                this.selectedManualDividend.year = year;
                this.manualDividendForm.get('amount')?.setValue(null);
            } else {
                this.selectedManualDividend = entry.manualDividend;
                const tempShare = ShareCreator.createNewShare();
                tempShare.name = position?.share?.name ? position.share.name : '';
                this.selectedManualDividend.share = tempShare;
                this.manualDividendForm.get('amount')?.setValue(entry.manualDividend.amount);
            }
            this.manualDividendForm.get('year')?.setValue(this.selectedManualDividend.year);
            this.modalRef = this.modalService.open(template);
        }
    }

    persistManualDividend(): void {
        if (this.selectedManualDividend) {
            const amount = this.manualDividendForm.get('amount')?.value;
            console.log(amount);
            if (amount === '') {
                this.deleteManualDividend(this.selectedManualDividend);
            } else {
                this.selectedManualDividend.amount = amount;
                this.selectedManualDividend.year = this.manualDividendForm.get('year')?.value;
                if (this.selectedManualDividend.id > 0) {
                    this.manualDividendService.update(this.selectedManualDividend)
                        .subscribe(dividend => {
                            // todo: implement a data updater
                            document.location.reload();
                        });
                } else {
                    this.manualDividendService.create(this.selectedManualDividend)
                        .subscribe(dividend => {
                            // todo: implement a data updater
                            document.location.reload();
                        });
                }
            }
        }
        this.modalRef?.close();
    }

    confirmDeleteAccount(): void {
        if (this.selectedBankAccount) {
            this.deleteBankAccount(this.selectedBankAccount);
        }
        this.modalRef?.close();
    }

    deleteBankAccount(account: BankAccount): void {
        this.bankAccountService.delete(account.id).subscribe(() => {
            document.location.reload();
        });
    }

    deleteManualDividend(dividend: ManualDividend): void {
        this.manualDividendService.delete(dividend.id).subscribe(() => {
            document.location.reload();
        });
    }

    addWatchlistEntry(shareheadShare: ShareheadShare): void {
        this.watchlistService.addEntry(shareheadShare.id)
            .subscribe(newWatchlist => {
                if (this.portfolio) {
                    this.portfolio.watchlistEntries = newWatchlist;
                    this.loadWatchlist();
                }
            });
    }

    confirmDeleteWatchlistEntry(): void {
        if (this.selectedWatchlistEntry) {
            this.removeWatchlistEntry(this.selectedWatchlistEntry);
        }
        this.modalRef?.close();
    }

    removeWatchlistEntry(entry: WatchlistEntry): void {
        this.watchlistService.removeEntry(entry.shareheadId)
            .subscribe(newWatchlist => {
                if (this.portfolio) {
                    this.portfolio.watchlistEntries = newWatchlist;
                    this.loadWatchlist();
                }
            });
    }

    filterUltimateList(): void {
        this.ultimateBalanceList?.forEach(entry => {
            if (entry.labels && this.ultimateBalanceFilter) {
                if (this.checkFilterVisibility(entry.labels, this.ultimateBalanceFilter)) {
                    entry.visible = true;
                } else {
                    entry.visible = false;
                }
            }
        });
    }

    checkFilterVisibility(posiLabels: Label[], filterLabels: Label[]): boolean {
        let result = false;
        if (posiLabels.length === 0) {
            result = true;
        }
        posiLabels.forEach(label => {
            filterLabels.forEach(filter => {
                if (label.id === filter.id && filter.checked) {
                    result = true;
                }
            });
        });

        return result;
    }

    getAllLabels(): void
    {
        this.labelService.getAllLabels()
            .subscribe(labels => {
                this.labels = labels;
                localStorage.setItem('labels', JSON.stringify(this.labels));

                const ultimateFilter = localStorage.getItem('ultimateFilterLabel');
                if (ultimateFilter === null) {
                    this.ultimateBalanceFilter = this.labels;
                    this.ultimateBalanceFilter?.forEach((label) => {
                        label.checked = true;
                    });
                    localStorage.setItem('ultimateFilterLabel', JSON.stringify(this.ultimateBalanceFilter));
                } else {
                    this.ultimateBalanceFilter = JSON.parse(ultimateFilter);
                }
                this.filterUltimateList();
            });
    }

    toggleSelectionBalance(): void {
        this.selectionBalance = !this.selectionBalance;
    }

    positionEventHandler(event: any) {
        switch(event.key) {
            case 'details':
                if (this.selectedPosition) {
                    this.router.navigate(['/position-detail/' + this.selectedPosition.id]);
                }
                break;
            case 'addTransaction':
                if (this.selectedPosition) {
                    this.router.navigate(['/position/' + this.selectedPosition.id + '/cash-transaction-form']);
                }
                break;
            case 'editPosition':
                if (this.selectedPosition) {
                    let accountIndex = 0;
                    this.portfolio?.bankAccounts.forEach((account, index) => {
                        account.positions.forEach(position => {
                            if (this.selectedPosition && position.id === this.selectedPosition.id) {
                                accountIndex = index;
                            }
                        });
                    });
                    this.router.navigate(['/bank-account/' + accountIndex + '/position-form/' + this.selectedPosition.id]);
                }
                break;
            case 'delete':
                if (this.selectedPosition && this.removeModal) {
                    this.openPositionConfirmModal(this.removeModal, this.selectedPosition);
                }
                break;
        }
    }

    private loadWatchlist(): void
    {
        const shareheadIds: number[] = [];
        this.portfolio?.watchlistEntries.forEach(entry => {
            shareheadIds.push(entry.shareheadId);
        });
        this.shareheadService.getSharesCollection(shareheadIds).subscribe(shares => {
            this.assignShareheadShares(shares);
        });
    }


    private assignShareheadShares(shares: ShareheadShare[]) {
        shares.forEach(share => {
            this.portfolio?.watchlistEntries.forEach(entry => {
                if (+share.id === +entry.shareheadId) {
                    entry.shareheadShare = share;
                }
            });
        });
    }

    private setCashGridOptions() {
        this.cashColumns = [];
        this.cashColumns.push(
            {
                title: this.tranService.trans('GLOB_CURRENCY'),
                type: 'string',
                field: 'currency.name',
            },
            {
                title: this.tranService.trans('GLOB_VALUE'),
                type: 'function',
                format: '1.2',
                field: 'actualValue',
                alignment: 'right'
            },
            {
                title: 'Active From',
                type: 'date',
                format: 'dd.MM.y',
                field: 'activeFrom',
                responsive: 'md-up',
                width: '125px',
            },
            // {
            //     title: 'Active Until',
            //     type: 'date',
            //     format: 'dd.MM.y',
            //     field: 'activeUntil',
            //     responsive: 'xl-up',
            //     width: '125px',
            // },
            {
                title: 'Ta',
                type: 'number',
                format: '1.0',
                field: 'transactions.length',
                alignment: 'center',
                toolTip: this.tranService.trans('GLOB_TRANSACTIONS'),
                width: '40px',
            }
        );

        this.cashContextMenu = [];
        this.cashContextMenu.push(
            {
                key: 'details',
                label: 'Details',
            },
            {
                key: 'addTransaction',
                label: 'Add Transaction',
            },
            {
                key: 'delete',
                label: 'Löschen',
            },
        );
    }


    private setNonCashGridOptions() {
        this.nonCashColumns = [];
        this.nonCashColumns.push(
            {
                title: this.tranService.trans('GLOB_SHARE'),
                type: 'string',
                field: 'share.name',
            },
            {
                title: this.tranService.trans('GLOB_VALUE'),
                type: 'function',
                format: '1.0',
                field: 'actualValue',
                alignment: 'right',
                width: '75px',
                sortable: true,
            },
            {
                title: this.tranService.trans('GLOB_CURRENCY'),
                type: 'string',
                field: 'currency.name',
            },
            {
                title: 'Sector',
                type: 'string',
                field: 'sector.name',
                responsive: 'sm-up',
            },
            {
                title: 'Labels',
                type: 'renderer',
                field: 'labels',
                responsive: 'md-up',
                renderer: 'LabelsCellRendererComponent'
            },
            {
                title: 'Anteil',
                type: 'percent',
                format: '1.0-1',
                field: 'shareFromTotal',
                alignment: 'center',
                responsive: 'sm-up',
                sortable: true,
            },
            {
                title: 'Active From',
                type: 'date',
                format: 'dd.MM.y',
                field: 'activeFrom',
                responsive: 'md-up',
                width: '125px',
                sortable: true,
                sorted: true,
                sortDirection: 'up'
            },
            // {
            //     title: 'Active Until',
            //     type: 'date',
            //     format: 'dd.MM.y',
            //     field: 'activeUntil',
            //     responsive: 'xl-up',
            //     width: '125px',
            // },
            {
                title: '',
                type: 'renderer',
                field: '',
                renderer: 'PricealertsCellRendererComponent',
                width: '55px',
            },
            {
                title: 'Le',
                type: 'number',
                format: '1.0',
                field: 'logEntries.length',
                alignment: 'center',
                toolTip: 'Log entries',
                responsive: 'md-up',
                width: '40px',
                sortable: true,
            },
            {
                title: 'Ta',
                type: 'number',
                format: '1.0',
                field: 'realTransactions.length',
                alignment: 'center',
                toolTip: this.tranService.trans('GLOB_TRANSACTIONS'),
                responsive: 'sm-up',
                width: '40px',
                sortable: true,
            }
        );

        this.nonCashContextMenu = [];
        this.nonCashContextMenu.push(
            {
                key: 'details',
                label: 'Details',
            },
            {
                key: 'editPosition',
                label: 'Edit Position',
            },
            {
                key: 'delete',
                label: 'Löschen',
            },
        );
    }


    private setClosedGridOptions() {
        this.closedColumns = [];
        this.closedColumns.push(
            {
                title: this.tranService.trans('GLOB_SHARE'),
                type: 'string',
                field: 'share.name',
            },
            {
                title: 'Strategy',
                type: 'string',
                field: 'strategy.name',
                responsive: 'md-up',
            },
            {
                title: 'Sector',
                type: 'string',
                field: 'sector.name',
                responsive: 'md-up',
            },
            {
                title: 'Account',
                type: 'string',
                field: 'bankAccount.name',
                responsive: 'md-up',
            },
            {
                title: 'Result',
                type: 'number',
                field: 'balance.closedResult',
                format: '1.0',
                alignment: 'right',
                responsive: 'md-up',
            },
            {
                title: this.tranService.trans('GLOB_CURRENCY'),
                type: 'string',
                field: 'currency.name',
            },
            {
                title: 'Result CHF',
                type: 'function',
                field: 'closedResultCorrected',
                resultColoring: true,
                alignment: 'right',
                width: '95px',
            },
            {
                title: 'Active From',
                type: 'date',
                format: 'dd.MM.y',
                field: 'activeFrom',
                responsive: 'md-up',
                width: '125px',
            },
            {
                title: 'Active Until',
                type: 'date',
                format: 'dd.MM.y',
                field: 'activeUntil',
                responsive: 'sm-up',
                width: '125px',
            },
            {
                title: 'Le',
                type: 'number',
                format: '1.0',
                field: 'logEntries.length',
                alignment: 'center',
                toolTip: 'Log entries',
                responsive: 'md-up',
                width: '40px',
            },
            {
                title: 'Ta',
                type: 'number',
                format: '1.0',
                field: 'realTransactions.length',
                alignment: 'center',
                toolTip: this.tranService.trans('GLOB_TRANSACTIONS'),
                responsive: 'sm-up',
                width: '40px',
            }
        );

        this.closedContextMenu = [];
        this.closedContextMenu.push(
            {
                key: 'details',
                label: 'Details',
            },
            {
                key: 'delete',
                label: 'Löschen',
            },
        );
    }

}
