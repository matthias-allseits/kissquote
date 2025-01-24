import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {faEdit, faPlus, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import {TranslationService} from "../../services/translation.service";
import {CurrencyService} from "../../services/currency.service";
import {Currency} from "../../models/currency";
import {FormGroup, UntypedFormControl, Validators} from "@angular/forms";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {Label} from "../../models/label";
import {LabelCreator} from "../../creators/label-creator";
import {Sector} from "../../models/sector";
import {SectorCreator} from "../../creators/sector-creator";
import {LabelService} from "../../services/label.service";
import {SectorService} from "../../services/sector.service";
import {Strategy} from "../../models/strategy";
import {StrategyService} from "../../services/strategy.service";
import {StrategyCreator} from "../../creators/strategy-creator";
import {GridColumn, GridContextMenuItem} from "../data-grid/data-grid.component";


@Component({
  selector: 'app-dashboard-settings',
  templateUrl: './dashboard-settings.component.html',
  styleUrls: ['./dashboard-settings.component.scss']
})
export class DashboardSettingsComponent implements OnInit {

    @ViewChild('exchangeRateFormModal') currencyModal?: TemplateRef<any>;

    @Input() labels?: Label[];
    @Output() refreshLabels: EventEmitter<any> = new EventEmitter();

    protected readonly deleteIcon = faTrashAlt;
    protected readonly editIcon = faEdit;
    protected readonly addIcon = faPlus;

    public currencies?: Currency[];
    public sectors?: Sector[];
    public strategies?: Strategy[];
    public selectedCurrency?: Currency;
    public selectedLabel?: Label;
    public selectedSector?: Sector;
    public selectedStrategy?: Strategy;
    public color = 'ffffff';
    public darkMode = false;
    public relevanceLimit = 5000;

    public currenciesColumns?: GridColumn[];
    public currenciesContextMenu?: GridContextMenuItem[];

    modalRef?: NgbModalRef;

    settingsForm = new FormGroup({
        relevanceLimit: new UntypedFormControl('', Validators.required),
    });

    exchangeRateForm = new FormGroup({
        rate: new UntypedFormControl('', Validators.required),
    });

    labelForm = new FormGroup({
        name: new UntypedFormControl('', Validators.required),
        color: new UntypedFormControl('', Validators.required),
    });

    sectorForm = new FormGroup({
        name: new UntypedFormControl('', Validators.required),
    });

    strategyForm = new FormGroup({
        name: new UntypedFormControl('', Validators.required),
    });

    constructor(
        public tranService: TranslationService,
        private currencyService: CurrencyService,
        private labelService: LabelService,
        private sectorService: SectorService,
        private strategyService: StrategyService,
        private modalService: NgbModal,
    ) {
    }

    ngOnInit() {
        this.darkMode = localStorage.getItem('darkMode') === 'yes';
        const relevanceLimit = localStorage.getItem('relevanceLimit');
        if (relevanceLimit) {
            this.relevanceLimit = +relevanceLimit;
        }
        this.settingsForm.get('relevanceLimit')?.setValue(this.relevanceLimit);
        this.currencyService.getAllCurrencies()
            .subscribe(currencies => {
                this.currencies = currencies;
                localStorage.setItem('currencies', JSON.stringify(this.currencies));
            });
        this.sectorService.getAllSectors()
            .subscribe(sectors => {
                this.sectors = sectors;
            });
        this.strategyService.getAllStrategies()
            .subscribe(strategies => {
                this.strategies = strategies;
            });
        this.setCurrenciesGridOptions();
    }

    toggleDarkmode(): void {
        this.darkMode = !this.darkMode;
        localStorage.setItem('darkMode', this.darkMode ? 'yes' : 'no');
        document.location.reload();
    }

    persistRelevanceLimit(): void {
        const relevanceLimit = +this.settingsForm.get('relevanceLimit')?.getRawValue();
        console.log(relevanceLimit);
        if (relevanceLimit > 0) {
            localStorage.setItem('relevanceLimit', relevanceLimit.toString());
        }
    }

    openExchangeRateModal(template: TemplateRef<any>) {
        if (this.selectedCurrency) {
            this.exchangeRateForm.get('rate')?.setValue(this.selectedCurrency.rate);
            this.modalRef = this.modalService.open(template);
        }
    }

    persistExchangeRate(): void {
        if (this.selectedCurrency) {
            this.selectedCurrency.rate = this.exchangeRateForm.get('rate')?.value;
            this.currencyService.update(this.selectedCurrency)
                .subscribe(currency => {
                    // todo: implement a data updater
                    document.location.reload();
                });
        }
        this.modalRef?.close();
    }

    openLabelConfirmModal(template: TemplateRef<any>, entry: Label|undefined) {
        this.selectedLabel = entry;
        this.modalRef = this.modalService.open(template);
    }

    openLabelFormModal(template: TemplateRef<any>, entry: Label|undefined) {
        if (entry) {
            this.labelForm.get('name')?.setValue(entry.name);
            this.labelForm.get('color')?.setValue(entry.color);
            this.color = entry.color;
            this.selectedLabel = entry;
        } else {
            this.selectedLabel = LabelCreator.createNewLabel();
            this.labelForm.get('name')?.setValue('');
            this.labelForm.get('color')?.setValue('');
            this.color = '';
        }
        this.modalRef = this.modalService.open(template);
    }

    persistLabel(): void {
        if (this.selectedLabel) {
            this.selectedLabel.name = this.labelForm.get('name')?.value;
            localStorage.removeItem('ultimateFilterLabel');
            if (this.selectedLabel.id > 0) {
                this.labelService.update(this.selectedLabel)
                    .subscribe(label => {
                        this.refreshLabels.emit();
                    });
            } else {
                this.labelService.create(this.selectedLabel)
                    .subscribe(label => {
                        this.refreshLabels.emit();
                    });
            }
            this.selectedLabel = undefined;
        }
        this.modalRef?.close();
    }

    confirmDeleteLabel(): void {
        if (this.selectedLabel) {
            this.deleteLabel(this.selectedLabel);
        }
        this.modalRef?.close();
    }

    deleteLabel(label: Label): void {
        localStorage.removeItem('ultimateFilterLabel');
        this.labelService.delete(label.id).subscribe(() => {
            this.refreshLabels.emit();
        });
    }

    openSectorConfirmModal(template: TemplateRef<any>, entry: Sector|undefined) {
        this.selectedSector = entry;
        this.modalRef = this.modalService.open(template);
    }

    openSectorFormModal(template: TemplateRef<any>, entry: Sector|undefined) {
        if (entry) {
            this.sectorForm.get('name')?.setValue(entry.name);
            this.selectedSector = entry;
        } else {
            this.selectedSector = SectorCreator.createNewSector();
            this.sectorForm.get('name')?.setValue('');
        }
        this.modalRef = this.modalService.open(template);
    }

    persistSector(): void {
        if (this.selectedSector) {
            this.selectedSector.name = this.sectorForm.get('name')?.value;
            if (this.selectedSector.id > 0) {
                this.sectorService.update(this.selectedSector)
                    .subscribe(sector => {
                        this.sectors?.forEach( (sectr, index) => {
                            if (sectr.id === this.selectedSector?.id) {
                                if (this.sectors) {
                                    this.sectors[index] = sectr;
                                }
                            }
                        });
                    });
            } else {
                this.sectorService.create(this.selectedSector)
                    .subscribe(sector => {
                        if (this.sectors && sector) {
                            this.sectors.push(sector);
                        }
                    });
            }
            this.selectedSector = undefined;
        }
        this.modalRef?.close();
    }

    confirmDeleteSector(): void {
        if (this.selectedSector) {
            this.deleteSector(this.selectedSector);
        }
        this.modalRef?.close();
    }

    deleteSector(sector: Sector): void {
        this.sectorService.delete(sector.id).subscribe(() => {
            this.sectors?.forEach( (sectr, index) => {
                if (sectr.id === sector.id) {
                    this.sectors?.splice(index, 1);
                }
            });
        });
    }

    openStrategyConfirmModal(template: TemplateRef<any>, entry: Strategy|undefined) {
        this.selectedStrategy = entry;
        this.modalRef = this.modalService.open(template);
    }

    openStrategyFormModal(template: TemplateRef<any>, entry: Strategy|undefined) {
        if (entry) {
            this.strategyForm.get('name')?.setValue(entry.name);
            this.selectedStrategy = entry;
        } else {
            this.selectedStrategy = StrategyCreator.createNewStrategy();
            this.strategyForm.get('name')?.setValue('');
        }
        this.modalRef = this.modalService.open(template);
    }

    persistStrategy(): void {
        if (this.selectedStrategy) {
            this.selectedStrategy.name = this.strategyForm.get('name')?.value;
            if (this.selectedStrategy.id > 0) {
                this.strategyService.update(this.selectedStrategy)
                    .subscribe(strategy => {
                        this.strategies?.forEach( (strtegy, index) => {
                            if (strtegy.id === this.selectedStrategy?.id) {
                                if (this.strategies) {
                                    this.strategies[index] = strtegy;
                                }
                            }
                        });
                    });
            } else {
                this.strategyService.create(this.selectedStrategy)
                    .subscribe(strategy => {
                        if (this.strategies && strategy) {
                            this.strategies.push(strategy);
                        }
                    });
            }
            this.selectedStrategy = undefined;
        }
        this.modalRef?.close();
    }

    confirmDeleteStrategy(): void {
        if (this.selectedStrategy) {
            this.deleteStrategy(this.selectedStrategy);
        }
        this.modalRef?.close();
    }

    deleteStrategy(strategy: Strategy): void {
        this.strategyService.delete(strategy.id).subscribe(() => {
            this.strategies?.forEach( (strtegy, index) => {
                if (strtegy.id === strategy.id) {
                    this.strategies?.splice(index, 1);
                }
            });
        });
    }

    cancelModal(): void {
        this.modalRef?.close();
    }

    gridEventHandler(event: any) {
        switch(event.key) {
            case 'editCurrency':
                if (this.currencyModal) {
                    this.openExchangeRateModal(this.currencyModal);
                }
                break;
        }
    }

    selectCurrency(currency: Currency) {
        this.selectedCurrency = currency;
    }


    private setCurrenciesGridOptions() {
        this.currenciesColumns = [];
        this.currenciesColumns.push(
            {
                title: 'Name',
                type: 'string',
                field: 'name',
            },
            {
                title: 'Exchange rate',
                type: 'number',
                format: '1.0-3',
                field: 'rate',
                alignment: 'right',
            },
        );

        this.currenciesContextMenu = [];
        this.currenciesContextMenu.push(
            {
                key: 'editCurrency',
                label: 'Editieren',
            },
        );
    }

}
