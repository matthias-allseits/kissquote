import {Component, OnInit} from '@angular/core';
import {MotherFormComponent} from "../mother-form.component";
import {Transaction} from "../../models/transaction";
import {FormControl, FormGroup} from "@angular/forms";
import {PositionService} from "../../services/position.service";
import {Position} from "../../models/position";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {TransactionService} from "../../services/transaction.service";
import {TransactionCreator} from "../../creators/transaction-creator";
import { Location } from '@angular/common';


@Component({
    selector: 'app-transaction-form',
    templateUrl: './transaction-form.component.html',
    styleUrls: ['./transaction-form.component.scss']
})
export class TransactionFormComponent extends MotherFormComponent  implements OnInit {

    public transaction: Transaction;
    public positions: Position[] = [];

    transactionForm = new FormGroup({
        position: new FormControl(null),
        title: new FormControl(''),
        date: new FormControl(new Date()),
        quantity: new FormControl(0),
        rate: new FormControl(0),
        fee: new FormControl(0),
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private positionService: PositionService,
        private transactionService: TransactionService,
    ) {
        super();
        this.transaction = TransactionCreator.createNewTransaction();
    }

    ngOnInit(): void {
        this.loadData();
        this.route.params.subscribe((params: Params) => {
            const transactionId = +params['id'];
            if (transactionId) {
                this.transactionService.getTransaction(transactionId)
                    .subscribe(transaction => {
                        console.log(transaction);
                        if (transaction instanceof Transaction) {
                            this.transaction = transaction;
                            this.transactionForm.patchValue(transaction, { onlySelf: true });
                        }
                    });
            } else {
                this.transaction = TransactionCreator.createNewTransaction();
            }
        });
    }


    onSubmit(): void {
        this.patchValuesBack(this.transactionForm, this.transaction);
        console.log(this.transaction);
        if (this.transaction.id > 0) {
            this.transactionService.update(this.transaction)
                .subscribe(transaction => {
                    this.location.back();
                });
        } else {
            this.transactionService.create(this.transaction)
                .subscribe(transaction => {
                    this.router.navigate(['my-dashboard']);
                });
        }
    }


    private loadData(): void {
        this.positionService.getPositions()
            .subscribe(positions => {
                console.log(positions);
                this.positions = positions;
            });
    }

}
