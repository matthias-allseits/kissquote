import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Marketplace} from "../models/marketplace";
import {MarketplaceCreator} from "../creators/marketplace-creator";


@Injectable({
    providedIn: 'root'
})

export class MarketplaceService {

    private baseUrl = 'http://api.kissquote.local/api/marketplace';

    constructor(
        private http: HttpClient,
    ) {}


    public getAllMarketplaces(): Observable<Marketplace[]>
    {
        return this.http.get<Marketplace[]>(this.baseUrl)
            .pipe(
                map(res => MarketplaceCreator.fromApiArray(res))
            );
    }

}
