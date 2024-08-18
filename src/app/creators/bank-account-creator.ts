import {BankAccount} from "../models/bank-account";
import {PositionCreator} from "./position-creator";


export class BankAccountCreator {

    public static createNewBankAccount(): BankAccount {
        return new BankAccount(0, '', []);
    }

    public static fromApiArray(apiArray: BankAccount[]): BankAccount[] {
        const array: BankAccount[] = [];

        for (const accountList of apiArray) {
            const bankAccount = this.oneFromApiArray(accountList);
            if (undefined !== bankAccount) {
                array.push(bankAccount);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: BankAccount): BankAccount|undefined
    {
        if (apiArray !== undefined) {
            return new BankAccount(
                apiArray.id,
                apiArray.name,
                apiArray.positions ? PositionCreator.fromApiArray(apiArray.positions, apiArray.name) : [],
            );
        } else {
            return undefined;
        }
    }

}
