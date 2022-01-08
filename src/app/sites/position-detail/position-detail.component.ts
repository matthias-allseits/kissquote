import {Component, OnInit, TemplateRef} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Position} from '../../models/position';
import {PositionService} from '../../services/position.service';
import {faEdit, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import {Transaction} from "../../models/transaction";
import {TransactionService} from "../../services/transaction.service";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";


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
    modalRef?: BsModalRef;

    constructor(
        private route: ActivatedRoute,
        private positionService: PositionService,
        private transactionService: TransactionService,
        private modalService: BsModalService,
    ) { }

    openModal(template: TemplateRef<any>, transaction: Transaction) {
        this.selectedTransaction = transaction;
        this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
    }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            const positionId = +params['id'];
            if (positionId) {
                this.loadData(positionId);
            }
        });
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
            });
    }

}
