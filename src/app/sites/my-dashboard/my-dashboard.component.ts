import {Component, OnInit, TemplateRef} from '@angular/core';
import {DividendTotals, Portfolio} from '../../models/portfolio';
import {PortfolioService} from '../../services/portfolio.service';
import {faEdit, faPlus, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {faEye} from "@fortawesome/free-solid-svg-icons/faEye";
import {TranslationService} from "../../services/translation.service";
import {DividendTotal, Position} from "../../models/position";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {PositionService} from "../../services/position.service";
import {BankAccount} from "../../models/bank-account";
import {BankAccountService} from "../../services/bank-account.service";
import {ChartData} from "chart.js";
import {Currency} from "../../models/currency";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CurrencyService} from "../../services/currency.service";
import {ShareheadService} from "../../services/sharehead.service";
import {WatchlistEntry} from "../../models/watchlistEntry";


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
    private selectedPosition?: Position;
    private selectedBankAccount?: BankAccount;
    public selectedCurrency?: Currency;
    private availableDashboardTabs = ['balance', 'dividends', 'watchlist', 'settings', 'closedPositions'];
    public dashboardTab = '0';
    public dividendListTab = new Date().getFullYear();
    public dividendLists?: DividendTotals[];
    modalRef?: BsModalRef;

    exchangeRateForm = new FormGroup({
        rate: new FormControl('', Validators.required),
    });

    constructor(
        public tranService: TranslationService,
        private portfolioService: PortfolioService,
        private positionService: PositionService,
        private currencyService: CurrencyService,
        private bankAccountService: BankAccountService,
        private modalService: BsModalService,
        private shareheadService: ShareheadService,
    ) {
    }

    ngOnInit(): void {
        this.myKey = localStorage.getItem('my-key');
        if (null !== this.myKey) {
            // let us get the portfolio again with all its interesting data
            this.portfolioService.portfolioByKey(this.myKey)
                .subscribe(returnedPortfolio => {
                    console.log(returnedPortfolio);
                    if (returnedPortfolio instanceof Portfolio) {
                        this.portfolio = returnedPortfolio;
                        this.portfolio.bankAccounts.forEach((account, index) => {
                            this.availableDashboardTabs.push(index.toString());
                        });
                        const storedTab = localStorage.getItem('dashboardTab');
                        if (storedTab && this.availableDashboardTabs.indexOf(storedTab) > -1) {
                            this.dashboardTab = storedTab;
                        } else {
                            this.dashboardTab = '0';
                        }
                        this.loadShareheadShares();
                        // todo: implement a better solution
                        setTimeout (() => {
                            if (this.portfolio) {
                                this.dividendLists = this.portfolio.collectDividendLists();
                            }
                        }, 2000);
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
        } else {
            // todo: redirect back to landingpage. probably the solution: implement guards
        }
    }

    getBalanceChartDataByAccount(account: BankAccount): ChartData {
        return {
            labels: [ 'Kontogebühren vs Einnahmen' ],
            datasets: [
                {
                    label: 'Kontogebühren',
                    data: [account.getAccountFeesTotal()]
                },
                {
                    label: 'Einnahmen',
                    data: [account.getEarningsTotal()]
                },
            ]
        };
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
        this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
    }

    openWatchlistConfirmModal(template: TemplateRef<any>, entry: WatchlistEntry) {
        this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
    }


    confirmPosition(): void {
        if (this.selectedPosition) {
            this.deletePosition(this.selectedPosition);
        }
        this.modalRef?.hide();
    }

    cancelModal(): void {
        this.modalRef?.hide();
    }

    deletePosition(position: Position): void {
        this.positionService.delete(position.id).subscribe(() => {
            // todo: implement a data updater
            document.location.reload();
        });
    }

    openAccountConfirmModal(template: TemplateRef<any>, account: BankAccount) {
        this.selectedBankAccount = account;
        this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
    }

    openExchangeRateModal(template: TemplateRef<any>, currency: Currency) {
        console.log(template);
        this.selectedCurrency = currency;
        this.exchangeRateForm.get('rate')?.setValue(currency.rate);
        this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
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
        this.modalRef?.hide();
    }

    removeWatchlistEntry(): void {
        if (this.selectedBankAccount) {
            this.deleteBankAccount(this.selectedBankAccount);
        }
        this.modalRef?.hide();
    }

    confirmAccount(): void {
        if (this.selectedBankAccount) {
            this.deleteBankAccount(this.selectedBankAccount);
        }
        this.modalRef?.hide();
    }

    deleteBankAccount(account: BankAccount): void {
        console.log(account);
        this.bankAccountService.delete(account.id).subscribe(() => {
            document.location.reload();
        });
    }

    private loadShareheadShares(): void {
        if (this.portfolio) {
            this.portfolio.getAllPositions().forEach(position => {
                if (position.shareheadId !== undefined && position.shareheadId > 0 && position.active) {
                    this.shareheadService.getShare(position.shareheadId)
                        .subscribe(share => {
                            if (share) {
                                position.shareheadShare = share;
                            }
                        });
                }
            });
            this.portfolio.watchlistEntries.forEach(entry => {
                this.shareheadService.getShare(entry.shareheadId)
                    .subscribe(share => {
                        if (share) {
                            entry.shareheadShare = share;
                        }
                    });
            });
        }
    }

}
