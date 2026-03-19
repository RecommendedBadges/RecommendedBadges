import LightningDatatable from 'lightning/datatable';
import hyperlinkWithIconTemplate from './hyperlinkWithIconColumn.html';

export default class Datatable extends LightningDatatable {
    static customTypes = {
        hyperlinkWithIcon: {
            template: hyperlinkWithIconTemplate,
            typeAttributes: ['label', 'url', 'icons'],
            standardCellLayout: true
        }
    }
}