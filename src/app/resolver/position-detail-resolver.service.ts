import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {PositionService} from "../services/position.service";
import {Position} from "../models/position";


@Injectable({
  providedIn: 'root'
})
export class PositionDetailResolverService implements Resolve<Position>{

    private position?: Position;

    constructor(
        private positionService: PositionService,
    ) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Position> {
        const positionId = route.params['id'];
        console.log('positionId in resolver: ', positionId);

        return new Observable(holder => {
            this.positionService.getPosition(positionId)
                .subscribe(position => {
                    if (position) {
                        this.position = position;

                        holder.next(this.position);
                    }
                });
        });
    }

}
