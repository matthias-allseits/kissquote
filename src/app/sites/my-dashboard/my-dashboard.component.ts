import {Component, OnInit, TemplateRef} from '@angular/core';
import {Portfolio} from '../../models/portfolio';
import {PortfolioService} from '../../services/portfolio.service';
import {faEdit, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {faEye} from "@fortawesome/free-solid-svg-icons/faEye";
import {TranslationService} from "../../services/translation.service";
import {Position} from "../../models/position";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {Transaction} from "../../models/transaction";
import {PositionService} from "../../services/position.service";
import {BankAccount} from "../../models/bank-account";
import {BankAccountService} from "../../services/bank-account.service";


@Component({
    selector: 'app-my-dashboard',
    templateUrl: './my-dashboard.component.html',
    styleUrls: ['./my-dashboard.component.scss']
})
export class MyDashboardComponent implements OnInit {

    editIcon = faEdit;
    eyeIcon = faEye;
    deleteIcon = faTrashAlt;

    public myKey: string|null = null;
    // todo: the portfolio has to be ready at this time. probably the solution: resolvers!
    public portfolio: Portfolio|null = null;
    private selectedPosition?: Position;
    private selectedBankAccount?: BankAccount;
    modalRef?: BsModalRef;

    constructor(
        public tranService: TranslationService,
        private portfolioService: PortfolioService,
        private positionService: PositionService,
        private bankAccountService: BankAccountService,
        private modalService: BsModalService,
    ) {
    }

    ngOnInit(): void {
        this.myKey = localStorage.getItem('my-key');
        if (null !== this.myKey) {
            // let us get the portfolio again with all its interesting data
            this.portfolioService.portfolioByKey(this.myKey)
                .subscribe(returnedPortfolio => {
                    console.log(returnedPortfolio);
                    if (returnedPortfolio instanceof Portfolio) {
                        this.portfolio = returnedPortfolio;
                    } else {
                        alert('Something went wrong!');
                        // todo: redirect back to landingpage. probably the solution: implement guards
                    }
                });
        } else {
            // todo: redirect back to landingpage. probably the solution: implement guards
        }
    }

    openPositionConfirmModal(template: TemplateRef<any>, position: Position) {
        this.selectedPosition = position;
        this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
    }


    confirmPosition(): void {
        if (this.selectedPosition) {
            this.deletePosition(this.selectedPosition);
        }
        this.modalRef?.hide();
    }

    declinePosition(): void {
        this.modalRef?.hide();
    }

    deletePosition(position: Position): void {
        console.log(position);
        this.positionService.delete(position.id).subscribe(() => {
            document.location.reload();
        });
    }


    openAccountConfirmModal(template: TemplateRef<any>, account: BankAccount) {
        this.selectedBankAccount = account;
        this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
    }

    confirmAccount(): void {
        if (this.selectedBankAccount) {
            this.deleteBankAccount(this.selectedBankAccount);
        }
        this.modalRef?.hide();
    }

    declineAccount(): void {
        this.modalRef?.hide();
    }

    deleteBankAccount(account: BankAccount): void {
        console.log(account);
        this.bankAccountService.delete(account.id).subscribe(() => {
            document.location.reload();
        });
    }

}
