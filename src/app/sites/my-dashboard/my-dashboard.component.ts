import {Component, OnInit, TemplateRef} from '@angular/core';
import {DividendTotals, Portfolio} from '../../models/portfolio';
import {faEdit, faPlus, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {faEye} from "@fortawesome/free-solid-svg-icons/faEye";
import {TranslationService} from "../../services/translation.service";
import {Position} from "../../models/position";
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
import {ActivatedRoute} from "@angular/router";


@Component({
    selector: 'app-my-dashboard',
    templateUrl: './my-dashboard.component.html',
    styleUrls: ['./my-dashboard.component.scss']
})
export class MyDashboardComponent implements OnInit {

    protected readonly eyeIcon = faEye;
    protected readonly deleteIcon = faTrashAlt;
    protected readonly addIcon = faPlus;
    protected readonly editIcon = faEdit;

    public myKey: string|null = null;
    // todo: the portfolio has to be ready at this time. probably the solution: resolvers!
    public portfolio: Portfolio|null = null;
    public labels?: Label[];
    private selectedPosition?: Position;
    private selectedBankAccount?: BankAccount;
    public selectedWatchlistEntry?: WatchlistEntry;
    public selectedManualDividend?: ManualDividend;
    private availableDashboardTabs = ['balance', 'dividends', 'watchlist', 'settings', 'closedPositions', 'listings'];
    public dashboardTab = '0';
    public dividendListTab = new Date().getFullYear();
    public dividendLists?: DividendTotals[];
    public closedPositionsBalance = 0;
    public years = [2023, 2024, 2025, 2026];
    public ultimateBalanceList?: Position[];
    public ultimateBalanceFilter?: Label[];
    public shareheadSharesLoaded = false;
    modalRef?: NgbModalRef;

    manualDividendForm = new FormGroup({
        year: new UntypedFormControl(new Date().getFullYear(), Validators.required),
        amount: new UntypedFormControl('', Validators.required),
    });

    constructor(
        public tranService: TranslationService,
        private route: ActivatedRoute,
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
            // console.log(data);
            if (data['portfolio'] instanceof Portfolio) {
                this.portfolio = data['portfolio'];
                this.shareheadSharesLoaded = true;
                if (this.portfolio) {
                    this.dividendLists = this.portfolio.collectDividendLists();
                }
                this.portfolio.bankAccounts.forEach((account, index) => {
                    this.availableDashboardTabs.push(index.toString());
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
            }
        });
    }

    changeTab(selectedTab: string): void {
        this.dashboardTab = selectedTab;
        localStorage.setItem('dashboardTab', selectedTab);
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

    openManualDividendConfirmModal(template: TemplateRef<any>, entry: ManualDividend|undefined) {
        this.selectedManualDividend = entry;
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

    openManualDividendModal(template: TemplateRef<any>, positionId: number) {
        const position = this.portfolio?.positionById(positionId);
        if (position) {
            this.selectedManualDividend = DividendCreator.createNewDividend();
            this.selectedManualDividend.share = position.share;
            this.selectedManualDividend.year = new Date().getFullYear();
            this.modalRef = this.modalService.open(template);
        }
    }

    persistManualDividend(): void {
        if (this.selectedManualDividend) {
            this.selectedManualDividend.amount = this.manualDividendForm.get('amount')?.value;
            this.selectedManualDividend.year = this.manualDividendForm.get('year')?.value;
            this.manualDividendService.create(this.selectedManualDividend)
                .subscribe(dividend => {
                    // todo: implement a data updater
                    document.location.reload();
                });
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
        console.log(account);
        this.bankAccountService.delete(account.id).subscribe(() => {
            document.location.reload();
        });
    }

    confirmDeleteManualDividend(): void {
        if (this.selectedManualDividend) {
            this.deleteManualDividend(this.selectedManualDividend);
        }
        this.modalRef?.close();
    }

    deleteManualDividend(dividend: ManualDividend): void {
        this.manualDividendService.delete(dividend.id).subscribe(() => {
            document.location.reload();
        });
    }

    addWatchlistEntry(shareheadShare: ShareheadShare): void {
        this.watchlistService.addEntry(shareheadShare.shareheadId)
            .subscribe(newWatchlist => {
                if (this.portfolio) {
                    this.portfolio.watchlistEntries = newWatchlist;
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

                const ultimateFilter = localStorage.getItem('ultimateFilter');
                if (ultimateFilter === null) {
                    this.ultimateBalanceFilter = this.labels;
                    this.ultimateBalanceFilter?.forEach((label) => {
                        label.checked = true;
                    });
                    localStorage.setItem('ultimateFilter', JSON.stringify(this.ultimateBalanceFilter));
                } else {
                    this.ultimateBalanceFilter = JSON.parse(ultimateFilter);
                }
                this.filterUltimateList();
            });
    }

}
