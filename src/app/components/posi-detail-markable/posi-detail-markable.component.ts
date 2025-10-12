import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {PositionService} from "../../services/position.service";
import {MarkedLines} from "../../models/position";

@Component({
  selector: 'app-posi-detail-markable',
  templateUrl: './posi-detail-markable.component.html',
  styleUrls: ['./posi-detail-markable.component.scss']
})
export class PosiDetailMarkableComponent implements OnInit, OnChanges {

    @Input() positionId?: number;
    @Input() key?: string;
    @Input() markedLines?: MarkedLines|string;

    public marked = false;
    public color?: string = undefined;

    constructor(
        private positionService: PositionService,
    ) {
    }

    ngOnInit(): void {
        // if (this.key && this.markedLines && this.markedLines.indexOf(this.key) > -1) {
        //     this.marked = true;
        // }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.key && this.markedLines && this.markedLines instanceof Object) {
            if (this.markedLines.green instanceof Array && this.markedLines.green.indexOf(this.key) > -1) {
                this.marked = true;
                this.color = 'green';
            } else if (this.markedLines.red instanceof Array && this.markedLines.red.indexOf(this.key) > -1) {
                this.marked = true;
                this.color = 'red';
            } else if (this.markedLines.yellow instanceof Array && this.markedLines.yellow.indexOf(this.key) > -1) {
                this.marked = true;
                this.color = 'yellow';
            }
        }
    }

    toggleMarking(): void
    {
        let nextColor = 'green';
        if (this.color === 'green') {
            nextColor = 'red';
        } else if (this.color === 'red') {
            nextColor = 'yellow';
        } else if (this.color === 'yellow') {
            nextColor = 'none';
        }
        if (this.key !== undefined && this.positionId) {
            this.positionService.toggleMarkable(this.positionId, this.key, nextColor).subscribe(() => {
                this.marked = !this.marked;
                this.color = nextColor;
            });
        }
    }
}
