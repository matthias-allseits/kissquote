import {Component, Input} from '@angular/core';
import {CellRendererInterface} from "../cell-renderer.interface";


@Component({
  selector: 'app-pricealerts-cell-renderer',
  templateUrl: './pricealerts-cell-renderer.component.html',
  styleUrls: ['./pricealerts-cell-renderer.component.scss']
})
export class PricealertsCellRendererComponent implements CellRendererInterface {

    @Input() data: any;

}
