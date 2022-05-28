import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Position} from '../../models/position';
import {PositionService} from '../../services/position.service';
import {
    faChevronLeft, faChevronRight,
    faEdit,
    faExternalLinkAlt,
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
import {Rate} from "../../models/rate";


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

    public position?: Position;
    public selectedTransaction?: Transaction;
    public diviProjectionYears: DividendProjection[] = [];
    public positionTab = 'balance';
    public shareheadDividendPayment?: string;
    public shareheadDividendPaymentCorrected?: string;
    public shareheadCurrencyCorrectedDividendPayment?: string;
    public currentYieldOnValue = '';
    public currentYieldOnValueSource = '';
    modalRef?: BsModalRef;
    shareheadModalRef?: BsModalRef;

    public chartData?: ChartData;
    public lineChartData?: ChartData;
    public historicRates?: Rate[];

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
    }

    changeTab(selectedTab: string): void {
        console.log(selectedTab);
        this.positionTab = selectedTab;
        localStorage.setItem('positionTab', selectedTab);
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


    deleteTransaction(transaction: Transaction): void {
        console.log(transaction);
        this.transactionService.delete(transaction.id).subscribe(() => {
            if (this.position instanceof Position) {
                this.loadData(this.position.id);
            }
        });
    }


    navigateCross(direction: string): void {
        console.log(direction);
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
                console.log(positionIndex);
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
                console.log(nextIndex);
                const nextPosition = positions[nextIndex];
                this.position = undefined;
                this.router.navigate(['/position-detail/' + nextPosition.id]);
                this.loadData(nextPosition.id);
            });
    }


    private loadData(positionId: number): void {
        this.positionService.getPosition(positionId)
            .subscribe(position => {
                console.log(position);
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
                                }
                            })
                    }

                    this.position?.getRatesChartData()
                        .subscribe(data => {
                            this.lineChartData = data;
                            console.log('chartdata length: ' + this.lineChartData?.datasets[0].data.length);
                            this.addLatestRateToLineChart();
                            if (this.lineChartComponent) {
                                this.lineChartComponent.updateData(this.lineChartData);
                            }
                            const rates: Rate[] = [];
                            this.lineChartData.datasets[0].data.forEach((entry, i) => {
                                if (entry) {
                                    const rate = new Rate(new Date(), +entry);
                                    rates.push(rate);
                                }
                            });
                            this.historicRates = rates.slice(-220);
                        });
                }
            });
    }


    private addLatestRateToLineChart(): void
    {
        if (this.lineChartData && this.position?.balance) {
            if (this.lineChartData.labels && this.position.balance.lastRate?.date instanceof Date) {
                const lastLabel = this.lineChartData.labels[this.lineChartData.labels?.length -1];
                const lastLabelString = lastLabel + '';
                const lastLabelDate = DateHelper.convertGermanDateStringToDateObject(lastLabelString);
                const labelFromLastRate = DateHelper.convertDateToGerman(this.position.balance.lastRate?.date);
                const lastRate = this.position.balance.lastRate?.rate;
                console.log(lastLabel);
                if (lastLabel !== labelFromLastRate && this.position.balance.lastRate?.date > lastLabelDate) {
                    this.lineChartData.labels.push(labelFromLastRate);
                    this.lineChartData.datasets[0].data.push(lastRate);
                }
            }
        }
    }

}
