import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Position} from '../../models/position';
import {PositionService} from '../../services/position.service';
import {faEdit, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import {Transaction} from "../../models/transaction";
import {TransactionService} from "../../services/transaction.service";


@Component({
    selector: 'app-position-detail',
    templateUrl: './position-detail.component.html',
    styleUrls: ['./position-detail.component.scss']
})
export class PositionDetailComponent implements OnInit {

    editIcon = faEdit;
    deleteIcon = faTrashAlt;

    public position: Position|null = null;

    constructor(
        private route: ActivatedRoute,
        private positionService: PositionService,
        private transactionService: TransactionService,
    ) { }


    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            const positionId = +params['id'];
            if (positionId) {
                this.loadData(positionId);
            }
        });
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
