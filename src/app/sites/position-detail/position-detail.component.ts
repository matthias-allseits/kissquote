import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Position} from '../../models/position';
import {PositionService} from '../../services/position.service';


@Component({
    selector: 'app-position-detail',
    templateUrl: './position-detail.component.html',
    styleUrls: ['./position-detail.component.scss']
})
export class PositionDetailComponent implements OnInit {

    public position: Position;

    constructor(
        private route: ActivatedRoute,
        private positionService: PositionService,
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            const positionId = +params['id'];
            if (positionId) {
                this.positionService.getPosition(positionId)
                    .subscribe(position => {
                        console.log(position);
                        this.position = position;
                    });
            }
        });
    }

}
