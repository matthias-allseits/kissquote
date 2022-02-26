export class DateHelper {

    /**
     * converts a date object to a date string '2015-04-29'
     */
    public static convertDateToMysql(date: any): string {
        let ret = date;

        if (date instanceof Date) {
            const year = String(date.getFullYear());

            let month = String(date.getMonth() + 1);
            if (month.length === 1) {
                month = '0' + month;
            }

            let day = String(date.getDate());
            if (day.length === 1) {
                day = '0' + day;
            }

            ret = year + '-' + month + '-' + day;
        }

        return ret;
    }


    public static convertDateToGerman(date: Date): string {
        let year, month, day;

        year = String(date.getFullYear());
        month = String(date.getMonth() + 1);
        if (month.length === 1) {
            month = '0' + month;
        }
        day = String(date.getDate());
        if (day.length === 1) {
            day = '0' + day;
        }

        return day + '.' + month + '.' + year;
    }


    public static convertGermanDateStringToDateObject(date: string): Date {
        const year = +date.substr(6, 4);
        const monthIndex = +date.substr(4, 2) - 1;
        const day = +date.substr(0, 2);

        // console.log(year);
        // console.log(monthIndex);
        // console.log(day);

        const dateObject = new Date(year, monthIndex, day);

        return dateObject;
    }

}
