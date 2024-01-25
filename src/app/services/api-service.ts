import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import { map, catchError } from 'rxjs/operators';


export abstract class ApiService {

    protected headers = new HttpHeaders({'Content-Type': 'application/json'});
    protected apiUrl = 'http://api.kissquote.local/api';

    protected constructor(
        public url: string,
        protected http: HttpClient,
    ) {
        if (+window.location.port === 4300) {
            this.apiUrl = 'http://api.kissquote.local/api';
        } else if (+window.location.port === 4500) {
            this.apiUrl = 'http://localhost:8008/api';
        } else if (window.location.href.indexOf('allseits.ch') > -1) {
            this.apiUrl = 'https://api.kissquote.allseits.ch/api';
        } else {
            this.apiUrl = 'http://api-kissquote.dyn-o-saur.com/api';
        }

        this.apiUrl = this.apiUrl + this.url;
    }

    // protected extractData(res: Response) {
    //     return res['data'] || {};
    // }

    // protected handleError<T> (operation = 'operation', result?: T) {
    //     return (error: any): Observable<T> => {
    //
    //       // TODO: send the error to remote logging infrastructure
    //       console.error(error); // log to console instead
    //
    //       // TODO: better job of transforming error for user consumption
    //       // this.log(`${operation} failed: ${error.message}`);
    //
    //       // Let the app keep running by returning an empty result.
    //       return of(result as T);
    //     };
    // }
    //
    // /**
    //  * Returns success Response.
    //  * @param response
    //  * @param generator
    //  */
    // protected handleSuccess(response, generator) {
    //     if (response.success === true) {
    //         return generator;
    //     } else {
    //         return response.success;
    //     }
    // }
    //
    // delete(id: number): Observable<any> {
    //     const url = `${this.apiUrl}${id}`;
    //     return this.http.delete(url, { headers: this.headers })
    //         .pipe(
    //             map((data) => data),
    //             catchError(this.handleError('global delete', []))
    //         );
    // }
    //
    // deleteExtended(id: number): Observable<any> {
    //     const url = `${this.apiUrl}${id}`;
    //     return this.http.delete(url, { headers: this.headers })
    //         .pipe(
    //             map((data) => this.handleSuccess(data, data['message'])),
    //             catchError(this.handleError('global delete', []))
    //         );
    // }
    //
    // /**
    //  * Returns the order by string for API calls created from an ag-grid filter array
    //  */
    // getApiOrderByStringByGridArray(order: any): string {
    //     const orders = [];
    //     if (order.length > 0) {
    //         order.forEach(orderObject => {
    //             orders.push(orderObject.colId + '_' + orderObject.sort);
    //         });
    //     }
    //
    //     if (orders.length > 0) {
    //         return orders.join(',');
    //     }
    //     return '';
    // }
    //
    // /**
    //  * Returns an array with the API filter array created from an ag-grid filter array
    //  */
    // getApiSearchJsonStringByGridFilterArray(filter: any): string {
    //     const filters = [];
    //     for (const key in filter) {
    //         if (filter.hasOwnProperty(key)) {
    //             let value = '';
    //             if (typeof filter[key].value !== 'undefined') {
    //                 value = filter[key].value;
    //             }
    //             if (typeof filter[key].filter !== 'undefined') {
    //                 value = filter[key].filter;
    //             }
    //             if (
    //                 value.length > 0 ||
    //                 (typeof filter[key].value === 'number' && Number(value) > 0) ||
    //                 (typeof filter[key].value === 'object' && value.hasOwnProperty('a'))
    //             ) {
    //                 filters.push({field: key, condition: 'like', value: value});
    //             }
    //         }
    //     }
    //     return JSON.stringify(filters);
    // }
    //
    // /**
    //  * Returns the API HttpParams Object depending of the give parameters
    //  */
    // getApiUrlParamsObject(limit?: number, offset?: number, orderBy?: any) {
    //     let params = new HttpParams();
    //
    //     if (typeof limit !== 'undefined' && (limit >= 0 || limit === -1)) {
    //         params = params.append('limit', limit.toString());
    //     }
    //
    //     if (typeof offset !== 'undefined' && offset >= 0) {
    //         params = params.append('offset', offset.toString());
    //     }
    //
    //     if (typeof orderBy !== 'undefined') {
    //         const orderByString = this.getApiOrderByStringByGridArray(orderBy);
    //         if (orderByString.length > 0) {
    //             params = params.append('orderBy', orderByString);
    //         }
    //     }
    //     return params;
    // }
}
