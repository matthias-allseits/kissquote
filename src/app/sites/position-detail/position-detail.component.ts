import {Component, OnInit, TemplateRef} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Position} from '../../models/position';
import {PositionService} from '../../services/position.service';
import {faEdit, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import {Transaction} from "../../models/transaction";
import {TransactionService} from "../../services/transaction.service";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {ShareheadService} from "../../services/sharehead.service";
import {ShareheadShare} from "../../models/sharehead-share";
import {ChartData, ChartDataset} from "chart.js";


export interface DividendProjection {
    year: Date;
    projection: string;
    yield: string;
}

@Component({
    selector: 'app-position-detail',
    templateUrl: './position-detail.component.html',
    styleUrls: ['./position-detail.component.scss']
})
export class PositionDetailComponent implements OnInit {

    editIcon = faEdit;
    deleteIcon = faTrashAlt;

    public position: Position|null = null;
    public selectedTransaction?: Transaction;
    public shareheadShare?: ShareheadShare;
    public diviProjectionYears: DividendProjection[] = [];
    modalRef?: BsModalRef;

    public chartData?: ChartData;
    public lineChartData?: ChartData;

    constructor(
        private route: ActivatedRoute,
        private positionService: PositionService,
        private transactionService: TransactionService,
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
    }

    openModal(template: TemplateRef<any>, transaction: Transaction) {
        this.selectedTransaction = transaction;
        this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
    }


    confirm(): void {
        if (this.selectedTransaction) {
            this.deleteTransaction(this.selectedTransaction);
        }
        this.modalRef?.hide();
    }

    decline(): void {
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


    private loadData(positionId: number): void {
        this.positionService.getPosition(positionId)
            .subscribe(position => {
                console.log(position);
                this.position = position;
                if (this.position && this.position.balance) {
                    this.chartData = {
                        labels: [ 'Kosten vs Einnahmen' ],
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
                                this.shareheadShare = share;
                                console.log(this.shareheadShare);
                                if (this.position?.balance) {
                                    const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
                                    const nextYearDiviProjection = share.dividendProjectionForYear(nextYear);
                                    const nextYearP1 = new Date(new Date().setFullYear(new Date().getFullYear() + 2));
                                    const nextYearDiviProjectionP1 = share.dividendProjectionForYear(nextYearP1);
                                    const nextYearP2 = new Date(new Date().setFullYear(new Date().getFullYear() + 3));
                                    const nextYearDiviProjectionP2 = share.dividendProjectionForYear(nextYearP2);
                                    this.diviProjectionYears = [
                                        {
                                            year: nextYear,
                                            projection: '(by analyst-estimations) ' + ((nextYearDiviProjection * this.position?.balance?.amount).toFixed()).toString() + ' ' + share.estimationsCurrency(),
                                            yield: (100 / this.position.balance.investment * (nextYearDiviProjection * this.position?.balance?.amount)).toFixed(1).toString() + '%',
                                        },
                                        {
                                            year: nextYearP1,
                                            projection: '(by analyst-estimations) ' + ((nextYearDiviProjectionP1 * this.position?.balance?.amount).toFixed()).toString() + ' ' + share.estimationsCurrency(),
                                            yield: (100 / this.position.balance.investment * (nextYearDiviProjectionP1 * this.position?.balance?.amount)).toFixed(1).toString() + '%',
                                        },
                                        {
                                            year: nextYearP2,
                                            projection: '(by analyst-estimations) ' + ((nextYearDiviProjectionP2 * this.position?.balance?.amount).toFixed()).toString() + ' ' + share.estimationsCurrency(),
                                            yield: (100 / this.position.balance.investment * (nextYearDiviProjectionP2 * this.position?.balance?.amount)).toFixed(1).toString() + '%',
                                        },
                                    ];
                                }
                            }
                        })
                }

                this.lineChartData = this.position?.getRatesChartData();
            });
    }

}
