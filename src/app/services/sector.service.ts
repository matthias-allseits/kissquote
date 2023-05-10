import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {ApiService} from "./api-service";
import {Sector} from "../models/sector";
import {SectorCreator} from "../creators/sector-creator";


const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type':  'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})

export class SectorService extends ApiService {

    constructor(
        public override http: HttpClient,
    ) {
        super('/sector', http);
    }


    create(sector: Sector): Observable<Sector|null> {
        const url = `${this.apiUrl}`;
        return this.http
            .post(url, JSON.stringify(sector), httpOptions)
            .pipe(
                map(() => sector),
                // catchError(this.handleError)
            );
    }


    update(sector: Sector): Observable<Sector|null> {
        const url = `${this.apiUrl}/${sector.id}`;
        return this.http
            .put(url, JSON.stringify(sector), httpOptions)
            .pipe(
                map(() => sector),
                // catchError(this.handleError)
            );
    }


    public getAllSectors(): Observable<Sector[]>
    {
        return this.http.get<Sector[]>(this.apiUrl)
            .pipe(
                map(res => SectorCreator.fromApiArray(res))
            );
    }


    public delete(id: number): Observable<Object> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete(url, httpOptions)
            .pipe(
                // map(res => LabelCreator.fromApiArray(res)),
                // catchError(this.handleError)
            );
    }

}
