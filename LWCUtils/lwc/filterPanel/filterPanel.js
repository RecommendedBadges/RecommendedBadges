import { LightningElement, api } from 'lwc';

export default class FilterPanel extends LightningElement {
    currentFilters = [];
    @api filters;
    @api label;
    @api name;

    handleFilterChange(event) {
        const newFilters = event.detail.value;

        // eslint-disable-next-line one-var, no-ternary
        const eventType = newFilters.length > this.currentFilters.length ? 'add' : 'remove';

        // eslint-disable-next-line init-declarations
        let changedFilter;

        // eslint-disable-next-line default-case
        switch(eventType) {
            case 'add': 
                changedFilter = newFilters.find(selection => !this.currentFilters.includes(selection));
                break;
            case 'remove':
                changedFilter = this.currentFilters.find(selection => !newFilters.includes(selection));
                break;
        }

        /* eslint-disable sort-keys */
        this.dispatchEvent(new CustomEvent('filterchange', {
            detail: {
                type: eventType,
                filter: changedFilter
            }
        }));

        this.currentFilters = newFilters;
    }
}