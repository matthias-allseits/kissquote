import {BankAccount} from './bank-account';


export class Portfolio {

    constructor(
        public id: number,
        public userName: string|null,
        public hashKey: string|null,
        public startDate: Date|null,
        public bankAccounts: BankAccount[],
    ) {}


    public static oneFromApiArray(apiArray: Portfolio): Portfolio|null
    {
        if (apiArray !== undefined) {
            return new Portfolio(
                apiArray.id,
                apiArray.userName,
                apiArray.hashKey,
                apiArray.startDate ? new Date(apiArray.startDate) : null,
                apiArray.bankAccounts ? BankAccount.fromApiArray(apiArray.bankAccounts) : [],
            );
        } else {
            return null;
        }
    }

}
