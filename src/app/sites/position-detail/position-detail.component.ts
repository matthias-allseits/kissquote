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
import {ShareheadService} from "../../services/sharehead.service";
import {ShareheadShare} from "../../models/sharehead-share";
import {ChartData} from "chart.js";
import {LineChartComponent} from "../../components/line-chart/line-chart.component";
import {DividendProjection} from "../../models/dividend-projection";
import {ShareService} from "../../services/share.service";
import {CurrencyService} from "../../services/currency.service";
import {StockRate} from "../../models/stock-rate";
import {StockRateCreator} from "../../creators/stock-rate-creator";
import {FormControl, FormGroup, UntypedFormControl, Validators} from "@angular/forms";
import {TranslationService} from "../../services/translation.service";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {Label} from "../../models/label";
import {Observable} from "rxjs";
import {Sector} from "../../models/sector";
import {SectorService} from "../../services/sector.service";


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
    modalRef?: NgbModalRef;
    shareheadModalRef?: NgbModalRef;
    public showLabelsDropdown = false;
    public allLabels?: Label[];
    public allSectors?: Sector[];

    public chartData?: ChartData;
    public historicRates: StockRate[] = [];
    public historicStockRates: StockRate[] = [];
    public daysTillNextEx?: number;
    public daysTillNextReport?: number;

    manualDrawdownForm = new FormGroup({
        amount: new UntypedFormControl('', Validators.required),
    });

    constructor(
        public tranService: TranslationService,
        private route: ActivatedRoute,
        private router: Router,
        private positionService: PositionService,
        private currencyService: CurrencyService,
        private sectorService: SectorService,
        private transactionService: TransactionService,
        private shareService: ShareService,
        private shareheadService: ShareheadService,
        private modalService: NgbModal,
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            const positionId = +params['id'];
            if (positionId) {
                this.loadData(positionId);
                this.checkAndResetPositionFilter(positionId);
            }
        });
        const storedTab = localStorage.getItem('positionTab');
        if (storedTab) {
            this.positionTab = storedTab;
        }
        const storedChartTab = localStorage.getItem('positionChartTab');
        if (storedChartTab) {
            this.chartTab = storedChartTab;
        } else {
            this.chartTab = 'bar';
            localStorage.setItem('positionChartTab', 'bar');
        }
        const labels = localStorage.getItem('labels');
        if (labels !== null) {
            this.allLabels = JSON.parse(labels);
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
        this.modalRef = this.modalService.open(template);
    }

    openShareheadConfirmModal(template: TemplateRef<any>) {
        this.shareheadModalRef = this.modalService.open(template);
    }


    confirm(): void {
        if (this.selectedTransaction) {
            this.deleteTransaction(this.selectedTransaction);
        }
        this.modalRef?.close();
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
        this.shareheadModalRef?.close();
    }


    decline(): void {
        this.modalRef?.close();
        this.shareheadModalRef?.close();
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

    openSectorModal(template: TemplateRef<any>) {
        if (this.allSectors === undefined) {
            this.sectorService.getAllSectors()
                .subscribe(sectors => {
                    this.allSectors = sectors;
                });
        }
        this.modalRef = this.modalService.open(template);
    }

    openManualDrawdownModal(template: TemplateRef<any>) {
        this.modalRef = this.modalService.open(template);
    }

    cancelModal(): void {
        this.modalRef?.close();
    }

    openManualDrawdownConfirmModal(template: TemplateRef<any>): void {
        this.shareheadModalRef = this.modalService.open(template);
    }

    openLabelModal(template: TemplateRef<any>): void {
        this.shareheadModalRef = this.modalService.open(template);
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
            this.position.manualDrawdown = +this.manualDrawdownForm.get('amount')?.value;
            this.positionService.update(this.position)
                .subscribe(position => {
                    if (position) {
                        this.position = position;
                        this.loadData(this.position.id);
                    }
                });
        }
        this.modalRef?.close();
    }


    deleteTransaction(transaction: Transaction): void {
        this.transactionService.delete(transaction.id).subscribe(() => {
            if (this.position instanceof Position) {
                this.loadData(this.position.id);
            }
        });
    }


    deleteLabel(label: Label): void {
        if (this.position) {
            this.positionService.deleteLabel(this.position.id, label.id).subscribe(() => {
                // if (this.position instanceof Position) {
                //     this.loadData(this.position.id);
                // }
            });
            this.position.labels?.forEach((labl, index) => {
                if (labl.id === label.id) {
                    this.position?.labels?.splice(index, 1);
                }
            });
        }
    }


    addLabel(label: Label): void {
        if (this.position) {
            this.positionService.addLabel(this.position.id, label.id).subscribe(() => {
                // if (this.position instanceof Position) {
                //     this.loadData(this.position.id);
                // }
            });
            this.position.labels?.push(label);
            this.showLabelsDropdown = false;
        }
    }


    setSector(sector: Sector|undefined): void {
        if (this.position) {
            this.position.sector = sector;
            this.positionService.update(this.position)
                .subscribe(posi => {
                    if (posi) {
                        this.position = posi;
                        this.loadData(this.position.id);
                    }
                });
        }
        this.cancelModal();
    }


    navigateCross(direction: string): void {
        let positionIndex: number = -1;
        this.getFilteredPositions()
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


    public toggleLabelsDropdown(): void {
        this.showLabelsDropdown = !this.showLabelsDropdown;
    }


    private loadData(positionId: number): void {
        this.diviProjectionYears = [];
        this.historicRates = [];
        this.historicStockRates = [];
        this.maxDrawdownSummary = undefined;
        this.daysTillNextEx = undefined;
        this.daysTillNextReport = undefined;
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
                                    if (share.plannedDividends && share.plannedDividends.length > 0) {
                                        const currentDate = new Date();
                                        const nextExDate = share.plannedDividends[0].exDate;
                                        this.daysTillNextEx = Math.floor((Date.UTC(nextExDate.getFullYear(), nextExDate.getMonth(), nextExDate.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) ) /(1000 * 60 * 60 * 24));
                                        if (share.nextReportDate) {
                                            const nextReportDate = share.nextReportDate;
                                            this.daysTillNextReport = Math.floor((Date.UTC(nextReportDate.getFullYear(), nextReportDate.getMonth(), nextReportDate.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
                                        }
                                    }
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


    private checkAndResetPositionFilter(positionId: number): void
    {
        let hit = false;
        this.getFilteredPositions()
            .subscribe(posis => {
                posis.forEach(posi => {
                    if (posi.id === positionId) {
                        hit = true;
                    }
                });
                if (!hit) {
                    localStorage.removeItem('ultimateFilter');
                }
            });
    }


    private getFilteredPositions(): Observable<Position[]>
    {
        return new Observable(psitons => {
            this.positionService.getNonCashAndActivePositions()
                .subscribe(posis => {
                    let positionsFilter = localStorage.getItem('ultimateFilter');
                    if (positionsFilter === null) {
                        psitons.next(posis);
                    } else {
                        positionsFilter = JSON.parse(positionsFilter);
                        const positions = this.filterPositions(posis, positionsFilter);
                        psitons.next(positions);
                    }
            });
        });
    }


    private filterPositions(allPositions: Position[], positionsFilter: any): Position[] {
        const filteredPosis: Position[] = [];
        allPositions?.forEach(entry => {
            if (entry.labels && positionsFilter) {
                if (this.checkFilterVisibility(entry.labels, positionsFilter)) {
                    filteredPosis.push(entry);
                }
            }
        });

        return filteredPosis;
    }


    private checkFilterVisibility(posiLabels: Label[], filterLabels: Label[]): boolean {
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

}
