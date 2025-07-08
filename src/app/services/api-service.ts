import {HttpClient, HttpHeaders} from '@angular/common/http';


export abstract class ApiService {

    protected headers = new HttpHeaders({'Content-Type': 'application/json'});
    protected apiUrl = 'http://api.kissquote.local/api';

    protected constructor(
        public url: string,
        protected http: HttpClient
    ) {
        if (+window.location.port === 4300) {
            this.apiUrl = 'http://api.kissquote.local/api';
        } else if (+window.location.port === 4500) {
            this.apiUrl = 'http://localhost:8000/api';
        } else if (window.location.href.indexOf('allseits.ch') > -1) {
            this.apiUrl = 'https://api.kissquote.allseits.ch/api';
        } else {
            this.apiUrl = 'http://api-kissquote.dyn-o-saur.com/api';
        }

        this.apiUrl = this.apiUrl + this.url;
    }
}
