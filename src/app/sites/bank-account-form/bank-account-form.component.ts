import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {PortfolioService} from '../../services/portfolio.service';
import {BankAccount} from '../../models/bank-account';
import {MotherFormComponent} from '../mother-form.component';
import {BankAccountService} from '../../services/bank-account.service';


@Component({
    selector: 'app-bank-account-form',
    templateUrl: './bank-account-form.component.html',
    styleUrls: ['./bank-account-form.component.scss']
})
export class BankAccountFormComponent extends MotherFormComponent implements OnInit {

    public bankAccount: BankAccount;
    bankAccountForm = new FormGroup({
        name: new FormControl(''),
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private portfolioService: PortfolioService,
        private bankAccountService: BankAccountService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            const bankAccountId = +params['id'];
            if (bankAccountId) {
                this.portfolioService.getBankAccountById(bankAccountId)
                    .subscribe(account => {
                        console.log(account);
                        this.bankAccount = account;
                        this.bankAccountForm.patchValue(account, { onlySelf: true });
                    });
            } else {
                this.bankAccount = new BankAccount(null, '', []);
            }
        });
    }


    onSubmit(): void {
        this.patchValuesBack(this.bankAccountForm, this.bankAccount);
        console.log(this.bankAccount);
        if (this.bankAccount.id > 0) {
            this.bankAccountService.update(this.bankAccount)
                .subscribe(account => {
                    this.router.navigate(['my-dashboard']);
                });
        } else {
            this.bankAccountService.create(this.bankAccount)
                .subscribe(account => {
                    this.router.navigate(['my-dashboard']);
                });
        }
        // TODO: Use EventEmitter with form value
        // console.warn(this.positionForm.value);
        // console.warn(this.position);
    }

}
