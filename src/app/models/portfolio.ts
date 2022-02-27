import {BankAccount} from './bank-account';
import {BankAccountCreator} from "../creators/bank-account-creator";
import {Share} from "./share";
import {Currency} from "./currency";


export class Portfolio {

    constructor(
        public id: number,
        public userName: string|null,
        public hashKey: string|null,
        public startDate: Date|null,
        public bankAccounts: BankAccount[],
    ) {}


    getBankAccountsWithoutPositions(): BankAccount[] {
        const copy: BankAccount[] = [];
        this.bankAccounts.forEach(account => {
            const cp = BankAccountCreator.createNewBankAccount();
            cp.id = account.id;
            cp.name = account.name;
            copy.push(cp);
        });

        return copy;
    }


    investmentTotal(): number {
        let total = 0;
        this.bankAccounts.forEach(account => {
            account.getNonCashPositions().forEach(position => {
                if (position.balance) {
                    total += position.balance?.investment;
                }
            });
        });

        return total;
    }


    valueTotal(): number {
        let total = 0;
        this.bankAccounts.forEach(account => {
            account.getNonCashPositions().forEach(position => {
                const actualValue = position.actualValue();
                if (actualValue) {
                    total += +actualValue;
                }
            });
        });

        return total;
    }


    cashTotal(): number {
        let total = 0;
        this.bankAccounts.forEach(account => {
            account.getCashPositions().forEach(position => {
                const actualValue = position.actualValue();
                if (actualValue) {
                    total += +actualValue;
                }
            });
        });

        return total;
    }


    dividendProjectionsTotal(): number {
        let total = 0;
        this.bankAccounts.forEach(account => {
            account.getNonCashPositions().forEach(position => {
                if (position.balance) {
                    total += position.balance?.projectedNextDividendPayment;
                }
            });
        });

        return total;
    }


    openPositionsBalance(): number {

        return this.valueTotal() - this.investmentTotal();
    }


    getAllCurrencies(): Currency[] {
        const currencies: Currency[] = [];
        const currencyIds: number[] = [];
        this.bankAccounts.forEach(account => {
            account.getCashPositions().forEach(position => {
                if (position.currency && currencyIds.indexOf(position.currency.id) === -1) {
                    currencies.push(position.currency);
                    currencyIds.push(position.currency.id);
                }
            });
        });

        return currencies;
    }


    getAllShares(): Share[] {
        const shares: Share[] = [];
        this.bankAccounts.forEach(account => {
            account.positions.forEach(position => {
                if (position.share) {
                    shares.push(position.share);
                }
            });
        });

        return shares;
    }


    getEmptyBankAccount(): BankAccount|null {
        let hit = null;
        this.bankAccounts.forEach(account => {
            if (account.positions.length === 0) {
                hit = account;
            }
        });

        return hit;
    }

}
