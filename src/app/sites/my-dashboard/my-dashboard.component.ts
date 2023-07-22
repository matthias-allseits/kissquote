import {Component, OnInit, TemplateRef} from '@angular/core';
import {DividendTotals, Portfolio} from '../../models/portfolio';
import {PortfolioService} from '../../services/portfolio.service';
import {faEdit, faPlus, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {faEye} from "@fortawesome/free-solid-svg-icons/faEye";
import {TranslationService} from "../../services/translation.service";
import {Position} from "../../models/position";
import {PositionService} from "../../services/position.service";
import {BankAccount} from "../../models/bank-account";
import {BankAccountService} from "../../services/bank-account.service";
import {Currency} from "../../models/currency";
import {FormGroup, UntypedFormControl, Validators} from "@angular/forms";
import {CurrencyService} from "../../services/currency.service";
import {ShareheadService} from "../../services/sharehead.service";
import {WatchlistEntry} from "../../models/watchlistEntry";
import {ShareheadShare} from "../../models/sharehead-share";
import {WatchlistService} from "../../services/watchlist.service";
import {ManualDividend} from "../../models/manual-dividend";
import {ManualDividendService} from "../../services/manual-dividend.service";
import {DividendCreator} from "../../creators/dividend-creator";
import {Observable} from "rxjs";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {Label} from "../../models/label";
import {LabelService} from "../../services/label.service";
import {LabelCreator} from "../../creators/label-creator";
import {Sector} from "../../models/sector";
import {SectorService} from "../../services/sector.service";
import {SectorCreator} from "../../creators/sector-creator";


@Component({
    selector: 'app-my-dashboard',
    templateUrl: './my-dashboard.component.html',
    styleUrls: ['./my-dashboard.component.scss']
})
export class MyDashboardComponent implements OnInit {

    eyeIcon = faEye;
    deleteIcon = faTrashAlt;
    addIcon = faPlus;
    editIcon = faEdit;

    public myKey: string|null = null;
    // todo: the portfolio has to be ready at this time. probably the solution: resolvers!
    public portfolio: Portfolio|null = null;
    public currencies?: Currency[];
    public labels?: Label[];
    public sectors?: Sector[];
    private selectedPosition?: Position;
    private selectedBankAccount?: BankAccount;
    public selectedCurrency?: Currency;
    public selectedWatchlistEntry?: WatchlistEntry;
    public selectedManualDividend?: ManualDividend;
    public selectedLabel?: Label;
    public selectedSector?: Sector;
    private availableDashboardTabs = ['balance', 'dividends', 'watchlist', 'settings', 'closedPositions', 'listings'];
    public dashboardTab = '0';
    public dividendListTab = new Date().getFullYear();
    public dividendLists?: DividendTotals[];
    public closedPositionsBalance = 0;
    public years = [2023, 2024, 2025, 2026];
    public ultimateBalanceList?: Position[];
    public ultimateBalanceFilter?: Label[];
    public color = 'ffffff';
    public shareheadSharesLoaded = false;
    modalRef?: NgbModalRef;

    exchangeRateForm = new FormGroup({
        rate: new UntypedFormControl('', Validators.required),
    });

    manualDividendForm = new FormGroup({
        year: new UntypedFormControl(new Date().getFullYear(), Validators.required),
        amount: new UntypedFormControl('', Validators.required),
    });

    labelForm = new FormGroup({
        name: new UntypedFormControl('', Validators.required),
        color: new UntypedFormControl('', Validators.required),
    });

    sectorForm = new FormGroup({
        name: new UntypedFormControl('', Validators.required),
    });

    constructor(
        public tranService: TranslationService,
        private portfolioService: PortfolioService,
        private positionService: PositionService,
        private currencyService: CurrencyService,
        private labelService: LabelService,
        private sectorService: SectorService,
        private bankAccountService: BankAccountService,
        private modalService: NgbModal,
        private shareheadService: ShareheadService,
        private watchlistService: WatchlistService,
        private manualDividendService: ManualDividendService,
    ) {
    }

    ngOnInit(): void {
        this.myKey = localStorage.getItem('my-key');
        if (null !== this.myKey) {
            // let us get the portfolio again with all its interesting data
            this.portfolioService.portfolioByKey(this.myKey)
                .subscribe(returnedPortfolio => {
                    if (returnedPortfolio instanceof Portfolio) {
                        this.portfolio = returnedPortfolio;
                        this.portfolio.calculatePositionsShareFromTotal();
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
                        this.ultimateBalanceList.sort((a,b) => (+a.totalReturnPerDay() < +b.totalReturnPerDay()) ? 1 : ((+b.totalReturnPerDay() < +a.totalReturnPerDay()) ? -1 : 0));
                        this.getAllLabels();
                        this.portfolio.getClosedNonCashPositions().forEach(position => {
                            if (position.balance?.closedResult) {
                                this.closedPositionsBalance += +position.closedResultCorrected();
                            }
                        });
                        this.loadShareheadShares()
                            .subscribe(result => {
                                this.shareheadSharesLoaded = true;
                                if (this.portfolio) {
                                    this.dividendLists = this.portfolio.collectDividendLists();
                                }
                            });
                    } else {
                        alert('Something went wrong!');
                        // todo: redirect back to landingpage. probably the solution: implement guards
                    }
                });
            this.currencyService.getAllCurrencies()
                .subscribe(currencies => {
                    this.currencies = currencies;
                    localStorage.setItem('currencies', JSON.stringify(this.currencies));
                });
            this.sectorService.getAllSectors()
                .subscribe(sectors => {
                    this.sectors = sectors;
                });
        } else {
            // todo: redirect back to landingpage. probably the solution: implement guards
        }
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

    openLabelConfirmModal(template: TemplateRef<any>, entry: Label|undefined) {
        this.selectedLabel = entry;
        this.modalRef = this.modalService.open(template);
    }

    openLabelFormModal(template: TemplateRef<any>, entry: Label|undefined) {
        if (entry) {
            this.labelForm.get('name')?.setValue(entry.name);
            this.labelForm.get('color')?.setValue(entry.color);
            this.color = entry.color;
            this.selectedLabel = entry;
        } else {
            this.selectedLabel = LabelCreator.createNewLabel();
            this.labelForm.get('name')?.setValue('');
            this.labelForm.get('color')?.setValue('');
            this.color = '';
        }
        this.modalRef = this.modalService.open(template);
    }

    openSectorConfirmModal(template: TemplateRef<any>, entry: Sector|undefined) {
        this.selectedSector = entry;
        this.modalRef = this.modalService.open(template);
    }

    openSectorFormModal(template: TemplateRef<any>, entry: Sector|undefined) {
        if (entry) {
            this.sectorForm.get('name')?.setValue(entry.name);
            this.selectedSector = entry;
        } else {
            this.selectedSector = SectorCreator.createNewSector();
            this.sectorForm.get('name')?.setValue('');
        }
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

    openExchangeRateModal(template: TemplateRef<any>, currency: Currency) {
        this.selectedCurrency = currency;
        this.exchangeRateForm.get('rate')?.setValue(currency.rate);
        this.modalRef = this.modalService.open(template);
    }

    persistExchangeRate(): void {
        if (this.selectedCurrency) {
            this.selectedCurrency.rate = this.exchangeRateForm.get('rate')?.value;
            this.currencyService.update(this.selectedCurrency)
                .subscribe(currency => {
                    // todo: implement a data updater
                    document.location.reload();
                });
        }
        this.modalRef?.close();
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

    persistLabel(): void {
        if (this.selectedLabel) {
            this.selectedLabel.name = this.labelForm.get('name')?.value;
            // this.selectedLabel.color = this.labelForm.get('color')?.value;
            if (this.selectedLabel.id > 0) {
                this.labelService.update(this.selectedLabel)
                    .subscribe(label => {
                        this.getAllLabels();
                    });
            } else {
                this.labelService.create(this.selectedLabel)
                    .subscribe(label => {
                        this.getAllLabels();
                    });
            }
            this.selectedLabel = undefined;
        }
        this.modalRef?.close();
    }

    persistSector(): void {
        if (this.selectedSector) {
            this.selectedSector.name = this.sectorForm.get('name')?.value;
            if (this.selectedSector.id > 0) {
                this.sectorService.update(this.selectedSector)
                    .subscribe(sector => {
                        this.sectors?.forEach( (sectr, index) => {
                            if (sectr.id === this.selectedSector?.id) {
                                if (this.sectors) {
                                    this.sectors[index] = sectr;
                                }
                            }
                        });
                    });
            } else {
                this.sectorService.create(this.selectedSector)
                    .subscribe(sector => {
                        if (this.sectors && sector) {
                            this.sectors.push(sector);
                        }
                    });
            }
            this.selectedSector = undefined;
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

    confirmDeleteLabel(): void {
        if (this.selectedLabel) {
            this.deleteLabel(this.selectedLabel);
        }
        this.modalRef?.close();
    }

    deleteLabel(label: Label): void {
        console.log(label);
        this.labelService.delete(label.id).subscribe(() => {
            this.getAllLabels();
        });
    }

    confirmDeleteSector(): void {
        if (this.selectedSector) {
            this.deleteSector(this.selectedSector);
        }
        this.modalRef?.close();
    }

    deleteSector(sector: Sector): void {
        this.sectorService.delete(sector.id).subscribe(() => {
            this.sectors?.forEach( (sectr, index) => {
                if (sectr.id === sector.id) {
                    this.sectors?.splice(index, 1);
                }
            });
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

    private loadShareheadShares(): Observable<boolean>
    {
        return new Observable(psitons => {
            let result = false;
            if (this.portfolio) {
                const allPositions = this.portfolio.getAllPositions();
                // console.log('length: ' + allPositions.length);
                let counter = 0;
                allPositions.forEach((position, index) => {
                    if (position.shareheadId !== undefined && position.shareheadId > 0 && position.active) {
                        this.shareheadService.getShare(position.shareheadId)
                            .subscribe(share => {
                                if (share) {
                                    position.shareheadShare = share;
                                }
                                counter++;
                                // console.log(counter);
                                if (counter == allPositions.length) {
                                    result = true;
                                    psitons.next(result);
                                }
                            });
                    } else {
                        counter++;
                        // console.log(counter);
                    }
                });
            }
        });
    }

    private getAllLabels(): void
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
