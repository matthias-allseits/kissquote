import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {PositionService} from "../../services/position.service";

@Component({
  selector: 'app-posi-detail-markable',
  templateUrl: './posi-detail-markable.component.html',
  styleUrls: ['./posi-detail-markable.component.scss']
})
export class PosiDetailMarkableComponent implements OnInit, OnChanges {

    @Input() positionId?: number;
    @Input() key?: string;
    @Input() markedLines?: string[]|string;

    public marked = false;

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
        if (this.key && this.markedLines && this.markedLines instanceof Array && this.markedLines.indexOf(this.key) > -1) {
            this.marked = true;
        }
    }

    toggleMarking(): void
    {
        if (screen.width > 400) {
            if (this.key !== undefined && this.positionId) {
                this.positionService.toggleMarkable(this.positionId, this.key).subscribe(() => {
                    this.marked = !this.marked;
                });
            }
        }
    }
}
