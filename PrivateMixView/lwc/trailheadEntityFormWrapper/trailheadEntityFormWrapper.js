/* eslint-disable no-underscore-dangle */
import { LightningElement, track } from 'lwc';

const OPTIONS = [
    { label: 'Recommended Badge', value: 'Recommended_Badge__c' },
    { label: 'Recommended Trail', value: 'Recommended_Trail__c' }
];

export default class TrailheadEntityFormWrapper extends LightningElement {
    @track badgeFormClasses = {
        'slds-hide': true,
        'slds-show': false
    };
    @track trailFormClasses = {
        'slds-hide': true,
        'slds-show': false
    };
    options = OPTIONS;
    _sObjectName;

    get sObjectName() {
        return this._sObjectName;
    }
    set sObjectName(value) {
        this._sObjectName = value;

        /* eslint-disable default-case */
        switch(value) {
            case 'Recommended_Badge__c':
                this.badgeFormClasses['slds-hide'] = false;
                this.badgeFormClasses['slds-show'] = true;
                this.trailFormClasses['slds-hide'] = true;
                this.trailFormClasses['slds-show'] = false;
                break;
            case 'Recommended_Trail__c':
                this.badgeFormClasses['slds-hide'] = true;
                this.badgeFormClasses['slds-show'] = false;
                this.trailFormClasses['slds-hide'] = false;
                this.trailFormClasses['slds-show'] = true;
                break;
        }
    }

    handleObjectChange(event) {
        this.sObjectName = event.detail.value;
    }
}