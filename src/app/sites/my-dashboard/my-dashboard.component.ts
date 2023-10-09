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
import {faEllipsisVertical} from "@fortawesome/free-solid-svg-icons/faEllipsisVertical";
import {GridColumn, GridContextMenuItem} from "../../components/data-grid/data-grid.component";


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
    protected readonly naviIcon = faEllipsisVertical;

    public myKey: string|null = null;
    // todo: the portfolio has to be ready at this time. probably the solution: resolvers!
    public portfolio: Portfolio|null = null;
    public labels?: Label[];
    private selectedPosition?: Position;
    private selectedBankAccount?: BankAccount;
    public selectedWatchlistEntry?: WatchlistEntry;
    public selectedManualDividend?: ManualDividend;
    private availableDashboardTabs = ['balance', 'logbook', 'dividends', 'watchlist', 'settings', 'closedPositions', 'listings'];
    public dashboardTab = '0';
    public dividendListTab = new Date().getFullYear();
    public dividendLists?: DividendTotals[];
    public closedPositionsBalance = 0;
    public years = [2023, 2024, 2025, 2026];
    public ultimateBalanceList?: Position[];
    public ultimateBalanceFilter?: Label[];
    public shareheadSharesLoaded = false;
    modalRef?: NgbModalRef;

    public cashColumns?: GridColumn[];
    public cashContextMenu?: GridContextMenuItem[];

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
            console.log(data);
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
                this.loadWatchlist();

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
                        format: '1.0',
                        field: 'actualValue',
                        alignment: 'right'
                    },
                    {
                        title: 'Active From',
                        type: 'date',
                        format: 'dd.MM.y', // todo: develop a elaborated date-formatter
                        field: 'activeFrom',
                        responsive: 'md-up',
                    },
                    {
                        title: 'Active Until',
                        type: 'date',
                        format: 'dd.MM.y',
                        field: 'activeUntil',
                        responsive: 'md-up',
                    },
                    {
                        title: 'Ta',
                        type: 'number',
                        format: '1.0',
                        field: 'transactions.length',
                        alignment: 'center',
                        toolTip: this.tranService.trans('GLOB_TRANSACTIONS'),
                        responsive: 'md-up',
                    }
                );

                this.cashContextMenu = [];
                this.cashContextMenu.push(
                    {
                        label: 'Details',
                    },
                    {
                        label: 'Add Transaction',
                    },
                    {
                        label: 'Löschen',
                    },
                );

                // <th scope="col">{{ tranService.trans('GLOB_CURRENCY') }}</th>
                // <th scope="col" style="width: 105px;"><span class="float-end">{{ tranService.trans('GLOB_VALUE') }}</span></th>
                // <th scope="col" class="d-none d-md-table-cell" style="width: 125px;">Active From</th>
                // <th scope="col" class="d-none d-md-table-cell" style="width: 125px;">Active Until</th>
                // <th scope="col" class="text-center d-none d-md-table-cell" style="width: 105px;"><span ngbTooltip="{{ tranService.trans('GLOB_TRANSACTIONS') }}" tooltipClass="custom-tooltip">Ta</span></th>
                // <th scope="col" class="d-none d-md-table-cell" style="width: 35px;"></th>
                //     <th scope="col" class="d-none d-md-table-cell" style="width: 35px;"></th>
                //     <th scope="col" class="d-none d-md-table-cell" style="width: 35px;"></th>
                //     <th scope="col" class="d-none d-md-table-cell" style="width: 35px;"></th>
                //     <th class="d-sm-none d-md-table-cell mobile-navi-cell"></th>

                // <tr *ngFor="let position of bankAccount.getCashPositions()">
                // <td><span *ngIf="position.currency">{{ position.currency.name }}</span></td>
                // <td><span class="float-end">{{ position.actualValue()|number: '1.0' }}</span></td>
                // <td class="d-none d-md-table-cell"><span *ngIf="position.activeFrom">{{ position.activeFrom|date:'dd.MM.y' }}</span></td>
                // <td class="d-none d-md-table-cell"><span *ngIf="position.activeUntil">{{ position.activeUntil|date:'dd.MM.y' }}</span></td>
                // <td class="text-center d-none d-md-table-cell">{{ position.transactions.length }}</td>
                // <td class="d-none d-md-table-cell"><button [routerLink]="['/position-detail/' + position.id]" type="button" class="btn btn-sm btn-outline-primary" ngbTooltip="Details" tooltipClass="custom-tooltip"><fa-icon [icon]="eyeIcon"></fa-icon></button></td>
                // <td class="d-none d-md-table-cell"><button [routerLink]="'/position/' + position.id + '/cash-transaction-form'" type="button" class="btn btn-sm btn-outline-primary" ngbTooltip="Add Transaction" tooltipClass="custom-tooltip"><fa-icon [icon]="addIcon"></fa-icon></button></td>
                // <td class="d-none d-md-table-cell"><button (click)="openPositionConfirmModal(removePositionModal, position)" type="button" class="btn btn-sm btn-outline-primary" ngbTooltip="Löschen" tooltipClass="custom-tooltip"><fa-icon [icon]="deleteIcon"></fa-icon></button></td>
                // <td class="d-sm-table-cell d-md-none mobile-navi-cell" ngbDropdown>
                // <fa-icon class="float-end" (click)="togglePositionsMenu(position)" id="positionsMenu" [icon]="naviIcon" ngbDropdownToggle></fa-icon>
                // <div ngbDropdownMenu aria-labelledby="positionsMenu">
                // <button [routerLink]="['/position-detail/' + position.id]" ngbDropdownItem>Details</button>
                // <button [routerLink]="'/position/' + position.id + '/cash-transaction-form'" ngbDropdownItem>Add Transaction</button>
                // <button (click)="openPositionConfirmModal(removePositionModal, position)" ngbDropdownItem>Löschen</button>
                // </div>
                // </td>
                // </tr>
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

    togglePositionsMenu(position: Position): void {
        this.selectedPosition = position;
        console.log(this.selectedPosition);
    }

    positionEventHandler(event: any) {
        console.log(event);
    }

    private loadWatchlist(): void
    {
        const shareheadIds: number[] = [];
        this.portfolio?.watchlistEntries.forEach(entry => {
            shareheadIds.push(entry.shareheadId);
        });
        this.shareheadService.getSharesCollection(shareheadIds).subscribe(shares => {
            shares.forEach(share => {
                this.portfolio?.watchlistEntries.forEach(entry => {
                    if (share.id === entry.shareheadId) {
                        entry.shareheadShare = share;
                    }
                });
            });
        });
    }

}
