import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Marketplace} from "../models/marketplace";
import {MarketplaceCreator} from "../creators/marketplace-creator";
import {ApiService} from "./api-service";


@Injectable({
    providedIn: 'root'
})

export class MarketplaceService extends ApiService {

    constructor(
        public override http: HttpClient,
    ) {
        super('/marketplace', http);
    }


    public getAllMarketplaces(): Observable<Marketplace[]>
    {
        return this.http.get<Marketplace[]>(this.apiUrl)
            .pipe(
                map(res => MarketplaceCreator.fromApiArray(res))
            );
    }

}
