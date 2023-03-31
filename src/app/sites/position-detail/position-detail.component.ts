import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MaxDrawdownSummary, Position} from '../../models/position';
import {PositionService} from '../../services/position.service';
import {
    faChevronLeft, faChevronRight,
    faEdit,
    faExternalLinkAlt, faPlus,
    faTrashAlt
} from "@fortawesome/free-solid-svg-icons";
import {Transaction} from "../../models/transaction";
import {TransactionService} from "../../services/transaction.service";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {ShareheadService} from "../../services/sharehead.service";
import {ShareheadShare} from "../../models/sharehead-share";
import {ChartData} from "chart.js";
import {DateHelper} from "../../core/datehelper";
import {LineChartComponent} from "../../components/line-chart/line-chart.component";
import {DividendProjection} from "../../models/dividend-projection";
import {ShareService} from "../../services/share.service";
import {CurrencyService} from "../../services/currency.service";
import {StockRate} from "../../models/stock-rate";
import {StockRateCreator} from "../../creators/stock-rate-creator";
import {FormControl, FormGroup, Validators} from "@angular/forms";


@Component({
    selector: 'app-position-detail',
    templateUrl: './position-detail.component.html',
    styleUrls: ['./position-detail.component.scss']
})
export class PositionDetailComponent implements OnInit {

    @ViewChild(LineChartComponent)
    private lineChartComponent!: LineChartComponent;

    editIcon = faEdit;
    deleteIcon = faTrashAlt;
    externalLinkIcon = faExternalLinkAlt;
    naviForwardIcon = faChevronRight;
    naviBackIcon = faChevronLeft;
    addIcon = faPlus;

    public position?: Position;
    public selectedTransaction?: Transaction;
    public diviProjectionYears: DividendProjection[] = [];
    public positionTab = 'balance';
    public chartTab = 'bar';
    public shareheadDividendPayment?: string;
    public shareheadDividendPaymentCorrected?: string;
    public shareheadCurrencyCorrectedDividendPayment?: string;
    public currentYieldOnValue = '';
    public currentYieldOnValueSource = '';
    public maxDrawdownSummary?: MaxDrawdownSummary;
    modalRef?: BsModalRef;
    shareheadModalRef?: BsModalRef;

    public chartData?: ChartData;
    public lineChartData?: ChartData;
    public historicRates: StockRate[] = [];
    public historicStockRates: StockRate[] = [];

    manualDrawdownForm = new FormGroup({
        amount: new FormControl('', Validators.required),
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private positionService: PositionService,
        private currencyService: CurrencyService,
        private transactionService: TransactionService,
        private shareService: ShareService,
        private shareheadService: ShareheadService,
        private modalService: BsModalService,
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            const positionId = +params['id'];
            if (positionId) {
                this.loadData(positionId);
            }
        });
        const storedTab = localStorage.getItem('positionTab');
        if (storedTab) {
            this.positionTab = storedTab;
        }
        const storedChartTab = localStorage.getItem('positionChartTab');
        if (storedChartTab) {
            this.chartTab = storedChartTab;
        }
    }

    changeTab(selectedTab: string): void {
        this.positionTab = selectedTab;
        localStorage.setItem('positionTab', selectedTab);
    }

    changeChartTab(selectedTab: string): void {
        this.chartTab = selectedTab;
        localStorage.setItem('positionChartTab', selectedTab);
    }

    openModal(template: TemplateRef<any>, transaction: Transaction) {
        this.selectedTransaction = transaction;
        this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
    }

    openShareheadConfirmModal(template: TemplateRef<any>) {
        this.shareheadModalRef = this.modalService.show(template, {class: 'modal-sm'});
    }


    confirm(): void {
        if (this.selectedTransaction) {
            this.deleteTransaction(this.selectedTransaction);
        }
        this.modalRef?.hide();
    }


    confirmShareheadRemoving(): void {
        if (this.position) {
            this.position.shareheadId = undefined;
            this.positionService.update(this.position)
                .subscribe(position => {
                    if (position) {
                        this.position = position;
                        this.loadData(this.position.id);
                    }
                });
        }
        this.shareheadModalRef?.hide();
    }


    decline(): void {
        this.modalRef?.hide();
        this.shareheadModalRef?.hide();
    }


    selectShareheadShare(shareheadShare: ShareheadShare): void {
        if (this.position) {
            this.position.shareheadId = shareheadShare.shareheadId;
            this.positionService.update(this.position)
                .subscribe(position => {
                    if (position) {
                        this.position = position;
                        this.loadData(this.position.id);
                    }
                });
        }
    }

    openManualDrawdownModal(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
    }

    cancelModal(): void {
        this.modalRef?.hide();
    }

    openManualDrawdownConfirmModal(template: TemplateRef<any>): void {
        this.shareheadModalRef = this.modalService.show(template, {class: 'modal-sm'});
    }

    confirmManualDrawdownRemoving(): void {
        if (this.position) {
            this.position.manualDrawdown = undefined;
            this.positionService.update(this.position)
                .subscribe(position => {
                    if (position) {
                        this.position = position;
                        this.loadData(this.position.id);
                    }
                });
        }
        this.decline();
    }

    persistManualDrawdown(): void {
        if (this.position) {
            this.position.manualDrawdown = this.manualDrawdownForm.get('amount')?.value;
            this.positionService.update(this.position)
                .subscribe(position => {
                    if (position) {
                        this.position = position;
                        this.loadData(this.position.id);
                    }
                });
        }
        this.modalRef?.hide();
    }


    deleteTransaction(transaction: Transaction): void {
        console.log(transaction);
        this.transactionService.delete(transaction.id).subscribe(() => {
            if (this.position instanceof Position) {
                this.loadData(this.position.id);
            }
        });
    }


    navigateCross(direction: string): void {
        let positionIndex: number = -1;
        this.positionService.getNonCashAndActivePositions()
            .subscribe(positions => {
                positions.forEach((position, index) => {
                    if (this.position) {
                        if (position.id === this.position.id) {
                            positionIndex = index;
                        }
                    }
                });
                let nextIndex = -1;
                if (direction === 'forward') {
                    nextIndex = positionIndex + 1;
                    if (nextIndex > positions.length - 1) {
                        nextIndex = 0;
                    }
                } else {
                    nextIndex = positionIndex - 1;
                    if (nextIndex < 0) {
                        nextIndex = positions.length - 1;
                    }
                }
                const nextPosition = positions[nextIndex];
                this.position = undefined;
                this.router.navigate(['/position-detail/' + nextPosition.id]);
                this.loadData(nextPosition.id);
            });
    }


    private loadData(positionId: number): void {
        this.diviProjectionYears = [];
        this.historicRates = [];
        this.historicStockRates = [];
        this.maxDrawdownSummary = undefined;
        this.positionService.getPosition(positionId)
            .subscribe(position => {
                if (position) {
                    this.position = position;
                    if (this.position.isCash) {
                        this.positionTab = 'transactions';
                    }
                    if (this.position.balance?.lastRate) {
                        this.currentYieldOnValue = (100 / this.position.balance.lastRate.rate * this.position.balance.projectedNextDividendPerShare()).toFixed(1);
                        this.currentYieldOnValueSource = '(from last payment)';
                    }
                    if (this.position && this.position.balance) {
                        this.chartData = {
                            labels: ['Kosten vs Einnahmen'],
                            datasets: [
                                {
                                    label: 'Kosten',
                                    data: [this.position.balance.transactionFeesTotal]
                                },
                                {
                                    label: 'Einnahmen',
                                    data: [this.position.balance.collectedDividends]
                                },
                            ]
                        };
                    }
                    if (this.position && this.position.shareheadId && this.position.shareheadId > 0) {
                        this.shareheadService.getShare(this.position.shareheadId)
                            .subscribe(share => {
                                if (share) {
                                    if (this.position) {
                                        this.position.shareheadShare = share;
                                    }
                                    this.diviProjectionYears = this.position?.dividendProjections();
                                    this.shareheadDividendPayment = this.position?.shareheadDividendPayment();
                                    this.shareheadDividendPaymentCorrected = this.position?.shareheadDividendPaymentCorrected();
                                    if (this.position && this.position.balance?.lastRate && this.shareheadDividendPayment !== undefined && +this.shareheadDividendPayment > 0) {
                                        this.currentYieldOnValue = (100 / +this.position.balance?.lastRate.rate * (+this.shareheadDividendPayment / this.position.balance.amount)).toFixed(1);
                                        this.currentYieldOnValueSource = '(from sharehead)';
                                    }

                                    if (this.position?.balance && this.position.shareheadShare) {
                                        if (this.position.currency?.name !== this.position.shareheadShare.currency?.name) {
                                            if (this.position.shareheadShare.currency) {
                                                const usersCurrency = this.currencyService.getUsersCurrencyByName(this.position.shareheadShare.currency?.name)
                                                    .subscribe(currency => {
                                                        if (this.shareheadDividendPayment && this.position?.currency) {
                                                            this.shareheadCurrencyCorrectedDividendPayment = (+this.shareheadDividendPayment * currency.rate / this.position?.currency.rate).toFixed(0);
                                                            if (this.position.balance?.lastRate) {
                                                                this.currentYieldOnValue = (100 / +this.position.balance?.lastRate.rate * (+this.shareheadCurrencyCorrectedDividendPayment / this.position.balance.amount)).toFixed(1);
                                                            }
                                                        }
                                                    });
                                            }
                                        }
                                    }
                                    this.maxDrawdownSummary = this.position?.getMaxDrawdownSummary();
                                }
                            })
                    }

                    this.position.getStockRates()
                        .subscribe((rates => {
                            this.addLatestRateToLineChart(rates);
                            if (screen.width < 400) {
                                this.historicRates = rates.slice(-200);
                                this.historicStockRates = rates.slice(-250);
                            } else {
                                this.historicRates = rates.slice(-440);
                                this.historicStockRates = rates.slice(-555);
                            }
                        }));
                }
            });
    }


    private addLatestRateToLineChart(rates: StockRate[]): void
    {
        if (this.position?.balance) {
            if (this.position.balance.lastRate?.date instanceof Date) {
                if (this.position.balance.lastRate.date > rates[rates.length - 1].date) {
                    if (this.position.share?.marketplace?.currency === 'GBX') {
                        // island apes shit!
                        const ratesCopy = StockRateCreator.createNewStockRate();
                        ratesCopy.rate = this.position.balance.lastRate.rate * 100;
                        ratesCopy.high = this.position.balance.lastRate.high;
                        ratesCopy.low = this.position.balance.lastRate.low;
                        rates.push(ratesCopy);
                    } else {
                        if (this.position.share?.name && this.position.share?.name?.indexOf('BRC') > -1) {
                            if (this.position.balance.lastRate.low === 0) {
                                this.position.balance.lastRate.low = this.position.balance.lastRate.rate / 10;
                            }
                            if (this.position.balance.lastRate.high === 0) {
                                this.position.balance.lastRate.high = this.position.balance.lastRate.rate / 10;
                            }
                        }
                        rates.push(this.position.balance.lastRate);
                    }
                }
            }
        }
    }

}
