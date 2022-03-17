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
import {DividendProjectionCreator} from "../../creators/dividend-projection-creator";
import {ShareheadEstimation} from "../../models/sharehead-estimation";
import {formatNumber} from "@angular/common";
import {ShareService} from "../../services/share.service";
import {CurrencyService} from "../../services/currency.service";


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
    public shareheadShare?: ShareheadShare;
    public diviProjectionYears: DividendProjection[] = [];
    public positionTab = 'balance';
    public shareheadDividendPayment?: string;
    public shareheadCurrencyCorrectedDividendPayment?: string;
    public currentYieldOnValue = '';
    public currentYieldOnValueSource = '';
    public nextEstimationYear = new Date().getFullYear() + 1;
    public shareheadShares: ShareheadShare[] = [];
    public selectableShares?: ShareheadShare[];
    modalRef?: BsModalRef;
    shareheadModalRef?: BsModalRef;

    public chartData?: ChartData;
    public lineChartData?: ChartData;

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
            this.shareheadShare = undefined;
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


    searchShare(event: any): void {
        console.log(event.target.value);
        this.selectableShares = [];
        if (event.target.value) {
            this.shareheadShares?.forEach(share => {
                if (share.name && share.name.toLowerCase().indexOf(event.target.value.toLowerCase()) > -1) {
                    this.selectableShares?.push(share);
                }
            });
        }
        console.log(this.selectableShares.length);
    }


    selectShare(shareheadShare: ShareheadShare): void {
        if (this.position) {
            this.position.shareheadId = shareheadShare.shareheadId;
            this.positionService.update(this.position)
                .subscribe(position => {
                    this.selectableShares = [];
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
        this.positionService.getPositions()
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
                    if (this.position.shareheadId === undefined) {
                        this.shareService.getAllShareheadShares()
                            .subscribe(shares => {
                                this.shareheadShares = shares;
                            });
                    }
                    if (this.position && this.position.shareheadId && this.position.shareheadId > 0) {
                        this.shareheadService.getShare(this.position.shareheadId)
                            .subscribe(share => {
                                if (share) {
                                    this.shareheadShare = share;
                                    console.log(this.shareheadShare);
                                    if (this.position?.balance) {
                                        const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
                                        const nextYearEstimation = share.dividendProjectionForYear(nextYear);

                                        const nextYearP1 = new Date(new Date().setFullYear(new Date().getFullYear() + 2));
                                        const nextYearEstimationP1 = share.dividendProjectionForYear(nextYearP1);

                                        const nextYearP2 = new Date(new Date().setFullYear(new Date().getFullYear() + 3));
                                        const nextYearEstimationP2 = share.dividendProjectionForYear(nextYearP2);
                                        this.diviProjectionYears = [];
                                        if (nextYearEstimation) {
                                            const projection = this.generateProjection(nextYear, nextYearEstimation);
                                            this.diviProjectionYears.push(projection);
                                        }
                                        if (nextYearEstimationP1) {
                                            const projection = this.generateProjection(nextYearP1, nextYearEstimationP1);
                                            this.diviProjectionYears.push(projection);
                                        }
                                        if (nextYearEstimationP2) {
                                            const projection = this.generateProjection(nextYearP2, nextYearEstimationP2);
                                            this.diviProjectionYears.push(projection);
                                        }
                                    }
                                    if (this.position?.balance) {
                                        const lastBalance = this.shareheadShare.lastBalance();
                                        if (lastBalance) {
                                            this.shareheadDividendPayment = (lastBalance?.dividend * this.position.balance.amount).toFixed(0);
                                            if (this.position.balance?.lastRate && +this.shareheadDividendPayment > 0) {
                                                this.currentYieldOnValue = (100 / +this.position.balance?.lastRate.rate * (+this.shareheadDividendPayment / this.position.balance.amount)).toFixed(1);
                                                this.currentYieldOnValueSource = '(from sharehead)';
                                            }
                                            if (this.position.currency?.name !== this.shareheadShare.currency?.name) {
                                                if (this.shareheadShare.currency) {
                                                    const usersCurrency = this.currencyService.getUsersCurrencyByName(this.shareheadShare.currency?.name)
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


    private generateProjection(nextYear: Date, nextYearEstimation: ShareheadEstimation): DividendProjection {
        const projection = DividendProjectionCreator.createNewDividendProjection();
        projection.year = nextYear;
        if (this.position?.balance && this.position?.currency?.rate) {
            let projectedValue = nextYearEstimation.dividend * this.position?.balance?.amount;
            projection.projection = '(by analyst-estimations) ' + formatNumber(projectedValue, 'de-CH', '0.0-0') + ' ' + nextYearEstimation.currency?.name;
            if (nextYearEstimation.currency && nextYearEstimation.currency.rate && this.position.currency?.name !== nextYearEstimation.currency?.name) {
                projectedValue = nextYearEstimation.dividend * nextYearEstimation.currency.rate * this.position?.balance?.amount;
                if (this.position.currency?.name !== 'CHF') {
                    projectedValue = projectedValue / this.position.currency.rate;
                }
                projection.currencyCorrectedProjection = 'currency-corrected: ' + formatNumber(projectedValue, 'de-CH', '0.0-0') + ' ' + this.position.currency?.name;
            }
            projection.yieldFloat = (100 / this.position.balance.investment * projectedValue).toFixed(1).toString() + '%';
        }

        return projection;
    }

}
