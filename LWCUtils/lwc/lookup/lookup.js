/* eslint-disable no-underscore-dangle, one-var */
import { LightningElement, api, track } from 'lwc';

import FORM_FACTOR from "@salesforce/client/formFactor";

const MAX_RENDERED_LOOKUP_ITEMS = 200;
const SEARCH_FILTER_DELAY = 500;

export default class Lookup extends LightningElement {
	allowBlur = true;
	@track dropdownDivClasses = {
		'slds-dropdown-trigger': true,
		'slds-dropdown-trigger_click': true,
		'slds-grid': true,
		'slds-wrap': true,
		'slds-var-m-horizontal_xx-small': true,
		'slds-is-open': false
	};
	firstRender = true;
	isSearchLoading = false;
	_lookupItems;
	@api objectName;
	@api placeholder;
	@api resultIconName;
	@api required = false
	@track searchResults;
	_selectedId;
	_selectedItem;
	timeoutId;
	_twoColumnLayout = false;

	get lookupLabelClasses() {
		return [
			'slds-col',
			'slds-size_1-of-1',
			FORM_FACTOR === 'Medium' && this.twoColumnLayout ? 'slds-medium-size_1-of-3' : 'slds-medium-size_1-of-1'
		];
	}

	get lookupSearchClasses() {
		return [
			'slds-col',
			'slds-size_1-of-1',
			FORM_FACTOR === 'Medium' && this.twoColumnLayout ? 'slds-medium-size_2-of-3' : 'slds-medium-size_1-of-1'
		];
	}

	get lookupSelectClasses() {
		return [
			'slds-col',
			'slds-size_1-of-1',
			FORM_FACTOR === 'Medium' && this.twoColumnLayout ? 'slds-medium-size_2-of-3' : 'slds-medium-size_1-of-1'
		];
	}

	get twoColumnLayout() {
		return this._twoColumnLayout;
	}
	@api
	set twoColumnLayout(value) {
		if(value === true) {
			this._twoColumnLayout = true;
		}
	}

	@api
	get selectedItem() {
		return this._selectedItem;
	}
	set selectedItem(value) {
		this._selectedItem = value;
	}

	get selectedId() {
		return this._selectedId;
	}
	@api
	set selectedId(value) {
		if(value) {
			this._selectedId = value;
			// eslint-disable-next-line no-magic-numbers
			if(this.lookupItems.length > 0) {
				// eslint-disable-next-line @lwc/lwc/no-api-reassignments -- only getter is public, not setter
				this.selectedItem = this.lookupItems.find(lookupItem => lookupItem.Id === value);
			}
		}
	}

	get lookupItems() {
		return this._lookupItems;
	};
	@api
	set lookupItems(value) {
		this._lookupItems = JSON.parse(JSON.stringify([...value]));
		this.searchResults = JSON.parse(JSON.stringify([...value]));
	}

	renderedCallback() {
		// eslint-disable-next-line no-magic-numbers
		if(this.lookupItems.length > 0 && this.selectedId && this.firstRender) {
			// eslint-disable-next-line @lwc/lwc/no-api-reassignments -- only getter is public, not setter
			this.selectedItem = this.lookupItems.find(lookupItem => lookupItem.Id === this.selectedId);
			this.firstRender = false;
		}
	}

	@api reset() {
		if(this.selectedId) {
			// eslint-disable-next-line @lwc/lwc/no-api-reassignments -- only getter is public, not setter
			this.selectedItem = this.lookupItems.find(lookupItem => lookupItem.Id === this.selectedId);
		} else {
			// eslint-disable-next-line @lwc/lwc/no-api-reassignments -- only getter is public, not setter
			this.selectedItem = null;
		}
	}

	handleInputChange(event) {
		this.isSearchLoading = true;
		clearTimeout(this.timeoutId);
		this.timeoutId = setTimeout(this.filterSearchResults.bind(this), SEARCH_FILTER_DELAY, event.target.value); // eslint-disable-line @lwc/lwc/no-async-operation
	}

	/* eslint-disable no-magic-numbers */
	filterSearchResults(searchTerm) {
		if(searchTerm.length === 0) {
			this.searchResults = this.lookupItems.slice(0, MAX_RENDERED_LOOKUP_ITEMS);
		} else {
			this.searchResults = this.lookupItems.filter(searchResult => searchResult.Name.toLowerCase().includes(searchTerm.toLowerCase()));
			this.searchResults = this.searchResults.slice(0, MAX_RENDERED_LOOKUP_ITEMS);
		}
		this.isSearchLoading = false;
	}

	handleInputFocus() {
		if(!this.dropdownDivClasses['slds-is-open']) {
			this.dropdownDivClasses['slds-is-open'] = true;
		}
	}

	handleInputBlur() {
		if(this.allowBlur) {
				this.closeDropdown();
		}
	}

	handleItemClick(event) {
		// eslint-disable-next-line @lwc/lwc/no-api-reassignments -- only getter is public, not setter
		this.selectedItem = event.detail;
		this.closeDropdown();
		this.dispatchEvent(new CustomEvent('itemselect', {detail: this.selectedItem}));
	}

	handleItemMouseDown() {
		this.allowBlur = false;
	}

	handleItemMouseUp() {
		this.allowBlur = true;
	}

	handleRemoveSelectedItem() {
		this.searchResults = this.lookupItems;
		this.selectedItem = null; // eslint-disable-line @lwc/lwc/no-api-reassignments -- only getter is public, not setter
		this.dispatchEvent(new CustomEvent('selectioncleared'));
	}

	closeDropdown() {
		if(this.dropdownDivClasses['slds-is-open']) {
			this.dropdownDivClasses['slds-is-open'] = false;
		}
	}
}