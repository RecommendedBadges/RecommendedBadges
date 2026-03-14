import { LightningElement, api } from 'lwc';

export default class Treegrid extends LightningElement {
    @api columns;
    @api expandedRows;
    @api keyField;
    @api treegridData;
    @api displayCustomTreegrid;
    @api sortedBy;
    @api sortDirection;

    @api expandAll() {
        this.refs.treegrid.expandAll();
    }

    @api collapseAll() {
        this.refs.treegrid.collapseAll();
    }

    @api getCurrentExpandedRows() {
        return this.refs.treegrid.getCurrentExpandedRows();
    }

    handleSort(event) {
        const { fieldName, sortDirection } = event.detail;
        this.sortedBy = fieldName;
        this.sortDirection = sortDirection;
        this.dispatchEvent(new CustomEvent('treegridsort', {
            detail: {
                fieldName,
                sortDirection
            }
        }));
    }
}