import {Component, OnInit} from '@angular/core';
import {MotherFormComponent} from "../mother-form.component";
import {Transaction} from "../../models/transaction";
import {FormControl, FormGroup} from "@angular/forms";
import {PositionService} from "../../services/position.service";
import {Position} from "../../models/position";
import {ActivatedRoute, Params} from "@angular/router";
import {TransactionService} from "../../services/transaction.service";
import {TransactionCreator} from "../../creators/transaction-creator";


@Component({
    selector: 'app-transaction-form',
    templateUrl: './transaction-form.component.html',
    styleUrls: ['./transaction-form.component.scss']
})
export class TransactionFormComponent extends MotherFormComponent  implements OnInit {

    public transaction: Transaction|null = null;
    public positions: Position[] = [];

    transactionForm = new FormGroup({
        position: new FormControl(null),
        title: new FormControl(''),
        date: new FormControl(new Date()),
        quantity: new FormControl(0),
        rate: new FormControl(0),
        fee: new FormControl(0),
        isFee: new FormControl(false),
        isInterest: new FormControl(false),
    });

    constructor(
        private route: ActivatedRoute,
        private positionService: PositionService,
        private transactionService: TransactionService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.loadData();
        this.route.params.subscribe((params: Params) => {
            const transactionId = +params['id'];
            if (transactionId) {
                this.transactionService.getTransaction(transactionId)
                    .subscribe(transaction => {
                        console.log(transaction);
                        this.transaction = transaction;
                        // this.positionForm.patchValue(transaction, { onlySelf: true });
                    });
            } else {
                this.transaction = TransactionCreator.createNewTransaction();
            }
        });
    }


    onSubmit(): void {
        this.patchValuesBack(this.transactionForm, this.transaction);
        // TODO: Use EventEmitter with form value
        // console.warn(this.positionForm.value);
        console.warn(this.transaction);
    }


    private loadData(): void {
        this.positionService.getPositions()
            .subscribe(positions => {
                console.log(positions);
                this.positions = positions;
            });
    }

}
