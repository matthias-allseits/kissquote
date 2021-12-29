import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Position} from '../models/position';
import {PositionCreator} from "../creators/position-creator";


@Injectable({
    providedIn: 'root'
})

export class PositionService {

    private baseUrl = 'http://api.kissquote.local/api/position';

    constructor(
        private http: HttpClient,
    ) {}


    public getPosition(id: number): Observable<Position|null>
    {
        return this.http.get<Position>(this.baseUrl + '/' + id)
            .pipe(
                map(res => PositionCreator.oneFromApiArray(res))
                // map(this.extractData),
                // catchError(this.handleError('addHero', portfolio))
                // catchError(this.handleError('addHero', portfolio))
            );
    }

}
