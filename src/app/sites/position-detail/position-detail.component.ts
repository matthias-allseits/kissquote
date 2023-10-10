import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DividendDropSummary, MaxDrawdownSummary, Position} from '../../models/position';
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
import {FormGroup, UntypedFormControl, Validators} from "@angular/forms";
import {TranslationService} from "../../services/translation.service";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {Label} from "../../models/label";
import {Observable} from "rxjs";
import {Sector} from "../../models/sector";
import {SectorService} from "../../services/sector.service";
import {PositionLog} from "../../models/position-log";
import {PositionLogService} from "../../services/position-log.service";
import {PositionLogCreator} from "../../creators/position-log-creator";
import {formatDate} from "@angular/common";
import {Strategy} from "../../models/strategy";
import {StrategyService} from "../../services/strategy.service";
import {TargetSummary} from "../../components/target-value/target-value.component";


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
    public shareheadDividendPayment?: string;
    public shareheadDividendPaymentCorrected?: string;
    public shareheadCurrencyCorrectedDividendPayment?: string;
    public currentYieldOnValue = '';
    public currentYieldOnValueSource = '';
    public maxDrawdownSummary?: MaxDrawdownSummary;
    public dividendDropSummary?: DividendDropSummary;
    modalRef?: NgbModalRef;
    shareheadModalRef?: NgbModalRef;
    public showLabelsDropdown = false;
    public allLabels?: Label[];
    public allSectors?: Sector[];
    public allStrategies?: Strategy[];
    public logBook?: any[];
    public commentsFilter = false;

    public selectedLogEntry?: PositionLog;
    public chartData?: ChartData;
    public historicRates: StockRate[] = [];
    public daysTillNextEx?: number;
    public daysTillNextPayment?: number;
    public daysTillNextReport?: number;
    public nextPayment?: number;
    public nextPaymentDate?: Date;
    public nextPaymentCurrency?: string;
    public nextPaymentCorrected?: number;
    public stopLossBroken = false;
    public hasReachedTargetPrice = false;
    public filteredPositions?: Position[];
    public rosaBrille?: TargetSummary;

    manualDrawdownForm = new FormGroup({
        amount: new UntypedFormControl('', Validators.required),
    });

    manualDividendDropForm = new FormGroup({
        amount: new UntypedFormControl('', Validators.required),
    });

    manualDividendForm = new FormGroup({
        dividend: new UntypedFormControl('', Validators.required),
    });

    stopLossForm = new FormGroup({
        amount: new UntypedFormControl('', Validators.required),
    });

    targetPriceForm = new FormGroup({
        amount: new UntypedFormControl('', Validators.required),
        type: new UntypedFormControl('', Validators.required),
    });

    logEntryForm = new FormGroup({
        date: new UntypedFormControl(new Date(), Validators.required),
        log: new UntypedFormControl('', Validators.required),
        emoticon: new UntypedFormControl(''),
    });

    constructor(
        public tranService: TranslationService,
        private route: ActivatedRoute,
        private router: Router,
        private positionService: PositionService,
        private currencyService: CurrencyService,
        private sectorService: SectorService,
        private strategyService: StrategyService,
        private positionLogService: PositionLogService,
        private transactionService: TransactionService,
        private shareService: ShareService,
        private shareheadService: ShareheadService,
        private modalService: NgbModal,
    ) {
    }

    ngOnInit(): void {
        this.route.data.subscribe(data => {
            this.position = undefined;
            this.historicRates = [];
            this.chartData = undefined;
            // console.log(data);
            // todo: find a better solution...
            setTimeout(() => {
                this.position = data['positionData']['position'];
                this.historicRates = data['positionData']['historicRates'];
                this.chartData = data['positionData']['costIncomeChartData'];
                this.loadData('ngOnInit');
            }, 100);
        });

        const storedTab = localStorage.getItem('positionTab');
        if (storedTab) {
            this.positionTab = storedTab;
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

    openModal(template: TemplateRef<any>, transaction: Transaction) {
        this.selectedTransaction = transaction;
        this.modalRef = this.modalService.open(template);
    }

    openShareheadConfirmModal(template: TemplateRef<any>) {
        this.shareheadModalRef = this.modalService.open(template);
    }

    openLogEntryConfirmModal(template: TemplateRef<any>, logEntry: PositionLog) {
        this.selectedLogEntry = logEntry;
        this.modalRef = this.modalService.open(template);
    }

    openUnderlyingConfirmModal(template: TemplateRef<any>) {
        this.modalRef = this.modalService.open(template);
    }

    goToUnderlying() {
        if (this.position?.underlying) {
            const underLyingId = this.position.underlying.id;
            this.position = undefined;
            this.router.navigate(['/position-detail/' + underLyingId]);
        }
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
                        this.position.shareheadShare = undefined;
                        this.loadData('confirmShareheadRemoving');
                        // todo: find a solution to really reload the whole page by resolver
                    }
                });
        }
        this.shareheadModalRef?.close();
    }

    confirmUnderlyingRemoving(): void {
        if (this.position) {
            this.position.removeUnderlying = true;
            this.positionService.update(this.position)
                .subscribe(position => {
                    if (position) {
                        this.position = position;
                        this.loadData('confirmUnderlyingRemoving');
                        // todo: find a solution to really reload the whole page by resolver
                    }
                });
        }
        this.modalRef?.close();
    }

    confirmLogEntryRemoving(): void {
        if (this.selectedLogEntry) {
            this.deleteLogEntry(this.selectedLogEntry);
        }
        this.modalRef?.close();
    }


    decline(): void {
        this.modalRef?.close();
        this.shareheadModalRef?.close();
    }


    selectShareheadShare(shareheadShare: ShareheadShare): void {
        if (this.position) {
            this.position.shareheadId = shareheadShare.id;
            this.positionService.update(this.position)
                .subscribe(position => {
                    if (position) {
                        this.position = position;
                        this.position.shareheadShare = shareheadShare;
                        this.loadData('selectShareheadShare');
                        // todo: find a solution to really reload the whole page
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

    openStrategyModal(template: TemplateRef<any>) {
        if (this.allStrategies === undefined) {
            this.strategyService.getAllStrategies()
                .subscribe(strategies => {
                    this.allStrategies = strategies;
                });
        }
        this.modalRef = this.modalService.open(template);
    }

    openManualDrawdownModal(template: TemplateRef<any>) {
        this.modalRef = this.modalService.open(template);
    }

    openStopLossModal(template: TemplateRef<any>) {
        this.stopLossForm.get('amount')?.setValue(this.position?.stopLoss);
        this.modalRef = this.modalService.open(template);
    }

    openTargetPriceModal(template: TemplateRef<any>) {
        this.targetPriceForm.get('amount')?.setValue(this.position?.targetPrice);
        this.targetPriceForm.get('type')?.setValue(this.position?.targetType);
        this.modalRef = this.modalService.open(template);
    }

    openManualDividendDropModal(template: TemplateRef<any>) {
        this.modalRef = this.modalService.open(template);
    }

    openManualDividendModal(template: TemplateRef<any>) {
        this.manualDividendForm.get('dividend')?.setValue(this.position?.manualDividend);
        this.modalRef = this.modalService.open(template);
    }

    cancelModal(): void {
        this.modalRef?.close();
    }

    openManualDrawdownConfirmModal(template: TemplateRef<any>): void {
        this.shareheadModalRef = this.modalService.open(template);
    }

    openManualDividendDropConfirmModal(template: TemplateRef<any>): void {
        this.shareheadModalRef = this.modalService.open(template);
    }

    openLabelModal(template: TemplateRef<any>): void {
        this.shareheadModalRef = this.modalService.open(template);
    }

    openLogEntryModal(template: TemplateRef<any>, entry: PositionLog|undefined): void {
        if (entry) {
            const dateString = formatDate(entry.date, 'yyyy-MM-dd', 'en');
            this.logEntryForm.get('date')?.setValue(dateString);
            this.logEntryForm.get('log')?.setValue(entry.log);
            this.logEntryForm.get('emoticon')?.setValue(entry.emoticon);
            this.selectedLogEntry = entry;
        } else {
            const now = new Date();
            const dateString = formatDate(now, 'yyyy-MM-dd', 'en');
            this.logEntryForm.get('date')?.setValue(dateString);
            this.logEntryForm.get('log')?.setValue('');
            this.logEntryForm.get('emoticon')?.setValue('');
            this.selectedLogEntry = PositionLogCreator.createNewPositionLog();
        }
        this.modalRef = this.modalService.open(template);
    }

    confirmManualDrawdownRemoving(): void {
        if (this.position) {
            this.position.manualDrawdown = undefined;
            this.positionService.update(this.position)
                .subscribe(position => {
                    if (position) {
                        this.position = position;
                        this.loadData('confirmManualDrawdownRemoving');
                        // todo: find a solution to really reload the whole page
                    }
                });
        }
        this.decline();
    }

    persistManualDividend(): void {
        if (this.position) {
            this.position.manualDividend = +this.manualDividendForm.get('dividend')?.value;
            this.positionService.update(this.position)
                .subscribe(position => {
                    if (position) {
                        this.position = position;
                        this.loadData('persistManualDividend');
                        // todo: find a solution to really reload the whole page
                    }
                });
        }
        this.modalRef?.close();
    }

    persistManualDrawdown(): void {
        if (this.position) {
            this.position.manualDrawdown = +this.manualDrawdownForm.get('amount')?.value;
            this.positionService.update(this.position)
                .subscribe(position => {
                    if (position) {
                        this.position = position;
                        this.loadData('persistManualDrawdown');
                        // todo: find a solution to really reload the whole page
                    }
                });
        }
        this.modalRef?.close();
    }

    confirmManualDividendDropRemoving(): void {
        if (this.position) {
            this.position.manualDividendDrop = undefined;
            this.positionService.update(this.position)
                .subscribe(position => {
                    if (position) {
                        this.position = position;
                        this.loadData('confirmManualDividendDropRemoving');
                        // todo: find a solution to really reload the whole page
                    }
                });
        }
        this.decline();
    }

    persistManualDividendDrop(): void {
        if (this.position) {
            this.position.manualDividendDrop = +this.manualDividendDropForm.get('amount')?.value;
            this.positionService.update(this.position)
                .subscribe(position => {
                    if (position) {
                        this.position = position;
                        this.loadData('persistManualDividendDrop');
                        // todo: find a solution to really reload the whole page
                    }
                });
        }
        this.modalRef?.close();
    }

    persistStopLoss(): void {
        if (this.position) {
            this.position.stopLoss = +this.stopLossForm.get('amount')?.value;
            this.positionService.update(this.position)
                .subscribe(position => {
                    if (position) {
                        this.position = position;
                        this.loadData('persistStopLoss');
                        this.refreshChart();
                    }
                });
        }
        this.modalRef?.close();
    }

    persistTargetPrice(): void {
        if (this.position) {
            this.position.targetPrice = +this.targetPriceForm.get('amount')?.value;
            this.position.targetType = this.targetPriceForm.get('type')?.value;
            this.positionService.update(this.position)
                .subscribe(position => {
                    if (position) {
                        this.position = position;
                        this.loadData('persistTargetPrice');
                        this.refreshChart();
                    }
                });
        }
        this.modalRef?.close();
    }

    persistLogEntry(): void {
        if (this.selectedLogEntry && this.position) {
            this.selectedLogEntry.positionId = this.position.id;
            this.selectedLogEntry.date = this.logEntryForm.get('date')?.value;
            this.selectedLogEntry.log = this.logEntryForm.get('log')?.value;
            this.selectedLogEntry.emoticon = this.logEntryForm.get('emoticon')?.value;
            if (this.selectedLogEntry.id > 0) {
                this.positionLogService.update(this.selectedLogEntry)
                    .subscribe(entry => {
                        this.positionLogService.replaceEntry(this.position?.logEntries, entry);
                        this.refreshLog();
                    });
            } else {
                this.positionLogService.create(this.selectedLogEntry)
                    .subscribe(entry => {
                        if (entry) {
                            this.position?.logEntries.push(entry);
                            this.refreshLog();
                        }
                    });
            }
            this.selectedLogEntry = undefined;
        }
        this.modalRef?.close();
    }


    deleteTransaction(transaction: Transaction): void {
        this.transactionService.delete(transaction.id).subscribe(() => {
            this.transactionService.removeEntry(this.position?.transactions, transaction);
            this.refreshLog();
        });
    }


    deleteLabel(label: Label): void {
        this.showLabelsDropdown = false;
        this.shareheadModalRef?.close();
        if (this.position) {
            this.positionService.deleteLabel(this.position.id, label.id).subscribe(() => {
                this.refreshLogHard();
            });
        }
    }

    deleteLogEntry(logEntry: PositionLog): void {
        this.positionLogService.delete(logEntry.id).subscribe(() => {
            this.positionLogService.removeEntry(this.position?.logEntries, logEntry);
            this.refreshLog();
        });
    }


    addLabel(label: Label): void {
        this.showLabelsDropdown = false;
        this.shareheadModalRef?.close();
        if (this.position) {
            this.positionService.addLabel(this.position.id, label.id).subscribe(() => {
                this.refreshLogHard();
            });
        }
    }


    setSector(sector: Sector|undefined): void {
        if (this.position) {
            this.position.sector = sector;
            this.positionService.update(this.position)
                .subscribe(posi => {
                    if (posi) {
                        this.position = posi;
                        this.loadData('setSector');
                        // todo: find a solution to really reload the whole page
                    }
                });
        }
        this.cancelModal();
    }


    setStrategy(strategy: Strategy|undefined): void {
        if (this.position) {
            this.position.strategy = strategy;
            this.positionService.update(this.position)
                .subscribe(posi => {
                    if (posi) {
                        this.position = posi;
                        this.loadData('setStrategy');
                        // todo: find a solution to really reload the whole page
                    }
                });
        }
        this.cancelModal();
    }

    getColspan(): number {
        if (screen.width < 400) {
            return 3;
        } else {
            return 4;
        }
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
                // this.loadData('navigateCross');
            });
    }


    public toggleLabelsDropdown(): void {
        this.showLabelsDropdown = !this.showLabelsDropdown;
    }

    toggleFilter(): void {
        this.commentsFilter = !this.commentsFilter;
        this.refreshLog();
    }

    private refreshLog(): void
    {
        if (this.position) {
            if (!this.commentsFilter) {
                this.logBook = this.position.logEntries;
            } else {
                this.logBook = [];
            }
            this.logBook = this.logBook.concat(this.position.transactions);
            this.logBook.sort((a, b) => (a.date < b.date) ? 1 : ((b.date < a.date) ? -1 : 0));
        }
    }

    private refreshLogHard(): void
    {
        if (this.position) {
            this.refreshPosition(this.position.id)
                .subscribe(result => {
                    this.refreshLog();
                });
        }
        // todo: find a solution to really reload the whole page
        // todo: get logentries and transactions from backend
    }


    private refreshPosition(positionId: number): Observable<boolean> {
        return new Observable(obs => {
            this.positionService.getPosition(positionId)
                .subscribe(position => {
                    if (position) {
                        const shareheadShare = this.position?.shareheadShare;
                        this.position = position;
                        this.position.shareheadShare = shareheadShare;
                        this.loadData('refreshPosition');
                    }

                    return obs.next(true);
                });
        });
    }


    private refreshChart(): void {
        // todo: find a better solution
        const tempData = this.historicRates;
        this.historicRates = [];
        setTimeout(() => {
            this.historicRates = tempData;
        }, 100);
    }


    private loadData(referer: string): void {
        // console.log('referer is: ' + referer);
        // console.log(this.position);
        this.diviProjectionYears = [];
        this.maxDrawdownSummary = undefined;
        this.dividendDropSummary = undefined;
        this.daysTillNextEx = undefined;
        this.daysTillNextPayment = undefined;
        this.daysTillNextReport = undefined;
        this.nextPayment = undefined;
        this.nextPaymentDate = undefined;
        this.nextPaymentCurrency = undefined;
        this.stopLossBroken = false;
        this.hasReachedTargetPrice = false;
        this.rosaBrille = undefined;

        if (this.position) {
            this.checkAndResetPositionFilter(this.position);

            this.refreshLog();
            if (this.position.isCash) {
                this.positionTab = 'logbook';
            }
            if (this.position.balance?.lastRate) {
                this.currentYieldOnValue = (100 / this.position.balance.lastRate.rate * this.position.balance.projectedNextDividendPerShare()).toFixed(1);
                this.currentYieldOnValueSource = '(from last payment)';
            }

            this.rosaBrille = this.position.getTargetSummary();

            if (this.position.shareheadShare) {
                const share = this.position.shareheadShare;
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
                this.dividendDropSummary = this.position?.getDividendDropSummary();
                if (share.plannedDividends && share.plannedDividends.length > 0) {
                    const currentDate = new Date();
                    const nextExDate = share.plannedDividends[0].exDate;
                    const nextPayDate = share.plannedDividends[0].payDate;
                    this.daysTillNextEx = Math.floor((Date.UTC(nextExDate.getFullYear(), nextExDate.getMonth(), nextExDate.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
                    this.daysTillNextPayment = Math.floor((Date.UTC(nextPayDate.getFullYear(), nextPayDate.getMonth(), nextPayDate.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
                    if (share.nextReportDate) {
                        const nextReportDate = share.nextReportDate;
                        this.daysTillNextReport = Math.floor((Date.UTC(nextReportDate.getFullYear(), nextReportDate.getMonth(), nextReportDate.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
                    }
                    if (this.position.balance) {
                        this.nextPaymentDate = nextPayDate;
                        this.nextPayment = share.plannedDividends[0].amount * this.position.balance?.amount;
                        if (share.plannedDividends[0].currency) {
                            this.nextPaymentCurrency = share.plannedDividends[0].currency.name;
                            if (this.position.currency?.name !== this.nextPaymentCurrency) {
                                this.nextPaymentCorrected = this.nextPayment * share.plannedDividends[0].currency.rate;
                                if (this.position.currency && this.position.currency?.name !== 'CHF') {
                                    this.nextPaymentCorrected = this.nextPaymentCorrected / this.position.currency.rate;
                                }
                            }
                        }
                    }
                }
            }
            if (this.position.stopLossBroken()) {
                this.stopLossBroken = true;
            }
            if (this.position.hasReachedTargetPrice()) {
                this.hasReachedTargetPrice = true;
            }
        }
    }


    private checkAndResetPositionFilter(position: Position): void
    {
        let hit = false;
        this.getFilteredPositions()
            .subscribe(posis => {
                posis.forEach(posi => {
                    if (posi.id === position.id) {
                        hit = true;
                    }
                });
                if (!hit && this.position?.motherId === undefined) {
                    // console.log('rasiere ultimate-filter');
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
                        if (screen.width > 400) {
                            this.filteredPositions = positions;
                        }
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
