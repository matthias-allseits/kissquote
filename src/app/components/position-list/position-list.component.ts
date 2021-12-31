import {Component, Input, OnInit} from '@angular/core';
import {Position} from "../../models/position";
import {TranslationService} from "../../services/translation.service";


@Component({
    selector: 'app-position-list',
    templateUrl: './position-list.component.html',
    styleUrls: ['./position-list.component.scss']
})
export class PositionListComponent implements OnInit {

    @Input() positions: Position[] = [];
    @Input() cash = false;

    constructor(
        public tranService: TranslationService,
    ) { }

    ngOnInit(): void {
    }

}
