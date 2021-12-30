import {Component, Input, OnInit} from '@angular/core';
import {Position} from "../../models/position";


@Component({
    selector: 'app-position-list',
    templateUrl: './position-list.component.html',
    styleUrls: ['./position-list.component.scss']
})
export class PositionListComponent implements OnInit {

    @Input() positions: Position[] = [];
    @Input() cash = false;

    constructor() {
    }

    ngOnInit(): void {
    }

}
