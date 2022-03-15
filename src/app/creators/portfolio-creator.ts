import {Portfolio} from "../models/portfolio";
import {BankAccountCreator} from './bank-account-creator';
import {CurrencyCreator} from "./currency-creator";


export class PortfolioCreator {

    public static oneFromApiArray(apiArray: Portfolio): Portfolio|null
    {
        if (apiArray !== undefined) {
            return new Portfolio(
                apiArray.id,
                apiArray.userName,
                apiArray.hashKey,
                apiArray.startDate ? new Date(apiArray.startDate) : null,
                apiArray.bankAccounts ? BankAccountCreator.fromApiArray(apiArray.bankAccounts) : [],
                apiArray.currencies ? CurrencyCreator.fromApiArray(apiArray.currencies) : [],
            );
        } else {
            return null;
        }
    }

}
