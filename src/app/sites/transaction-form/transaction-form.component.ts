import {Component, OnInit} from '@angular/core';
import {MotherFormComponent} from "../mother-form.component";
import {Transaction} from "../../models/transaction";
import {FormControl, FormGroup, Validators} from "@angular/forms";
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
    public position: Position|null = null;
    public positions: Position[] = [];

    transactionForm = new FormGroup({
        title: new FormControl(''),
        date: new FormControl(),
        quantity: new FormControl('', Validators.required),
        rate: new FormControl('', Validators.required),
        fee: new FormControl(''),
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
        const now = new Date();
        const dateString = now.getFullYear() + '-' + now.getMonth()+1 + '-0' + now.getDate();
        console.log(dateString);
        this.transactionForm.get('date')?.setValue(dateString);
        this.route.params.subscribe((params: Params) => {
            const positionId = +params['pid'];
            const transactionId = +params['id'];
            if (positionId > 0) {
                this.positionService.getPosition(positionId)
                    .subscribe(position => {
                        console.log(position);
                        if (position instanceof Position) {
                            this.position = position;
                        }
                    });
                if (transactionId > 0) {
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
            } else {
                throw Error;
            }
        });
    }

    get quantity() { return this.transactionForm.get('quantity'); }

    onSubmit(): void {
        this.patchValuesBack(this.transactionForm, this.transaction);
        this.transaction.position = this.position;
        if (this.transaction.position) {
            this.transaction.position.balance = undefined;
        }
        console.log(this.transaction);
        if (this.transaction.id > 0) {
            this.transactionService.update(this.transaction)
                .subscribe(transaction => {
                    this.location.back();
                });
        } else {
            this.transactionService.create(this.transaction)
                .subscribe(transaction => {
                    this.location.back();
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
