import {Component, Input} from '@angular/core';
import {CellRendererInterface} from "../cell-renderer.interface";


@Component({
  selector: 'app-labels-cell-renderer',
  templateUrl: './labels-cell-renderer.component.html',
  styleUrls: ['./labels-cell-renderer.component.scss']
})
export class LabelsCellRendererComponent implements CellRendererInterface {

    @Input() data: any;

}
