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
import {ShareheadShare} from "../../models/sharehead-share";
import {ShareCreator} from "../../creators/share-creator";
import { formatDate } from '@angular/common';


@Component({
    selector: 'app-transaction-form',
    templateUrl: './transaction-form.component.html',
    styleUrls: ['./transaction-form.component.scss']
})
export class TransactionFormComponent extends MotherFormComponent  implements OnInit {

    public transaction: Transaction;
    public position: Position|null = null;
    public titleOptions = ['Kauf', 'Fx-Gutschrift Comp.', 'Zins', 'Verkauf', 'Auszahlung', 'Dividende', 'Capital Gain', 'Forex-Gutschrift', 'Vergütung', 'Einzahlung', 'Depotgebühren', 'Fx-Belastung Comp.', 'Kapitalrückzahlung', 'Forex-Belastung', 'Corporate Action', 'Split'];

    transactionForm = new FormGroup({
        title: new FormControl('', Validators.required),
        date: new FormControl(null, Validators.required),
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
        const now = new Date();
        const dateString = formatDate(now, 'yyyy-MM-dd', 'en');
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
                                this.transactionForm.get('date')?.setValue(formatDate(transaction.date, 'yyyy-MM-dd', 'en'));
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


    selectTitle(title: string): void {
        const share = ShareCreator.createNewShare();
        this.transactionForm.get('title')?.setValue(title);
    }

}
