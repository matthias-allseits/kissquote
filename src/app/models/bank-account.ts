import {Position} from './position';


export class BankAccount {

    constructor(
        public id: number,
        public name: string,
        public positions: Position[],
    ) {}


    public static fromApiArray(apiArray: BankAccount[]): BankAccount[] {
        const array: BankAccount[] = [];

        for (const accountList of apiArray) {
            const bankAccount = this.oneFromApiArray(accountList);
            if (null !== bankAccount) {
                array.push(bankAccount);
            }
        }

        return array;
    }


    public static oneFromApiArray(apiArray: BankAccount): BankAccount|null
    {
        if (apiArray !== undefined) {
            return new BankAccount(
                apiArray.id,
                apiArray.name,
                apiArray.positions ? Position.fromApiArray(apiArray.positions) : [],
            );
        } else {
            return null;
        }
    }

}
