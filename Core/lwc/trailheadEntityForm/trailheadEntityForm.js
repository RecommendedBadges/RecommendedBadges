/**
 * Form component to override the New and Edit standard actions on Recommended Badge and Recommended Trail. Retrieves available Badges/Trails from 
 * Trail Tracker Provider through an Apex call. 
 * @author Ben Learn
 * @since 06-08-2024
 * @group Core
 */
/* eslint-disable one-var */
import { LightningElement, api, track, wire } from 'lwc';

import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import BADGE_API_NAME_FIELD from '@salesforce/schema/Recommended_Badge__c.BadgeAPIName__c'; // eslint-disable-line sort-imports
import BADGE_MIX_CATEGORY_FIELD from '@salesforce/schema/Recommended_Badge__c.Mix_Category__c';
import BADGE_NAME_FIELD from '@salesforce/schema/Recommended_Badge__c.BadgeName__c';
import CATEGORY_RANK_FIELD from '@salesforce/schema/Recommended_Badge__c.Category_Rank__c';
import HIGH_PRIORITY_FIELD from '@salesforce/schema/Recommended_Badge__c.High_Priority__c';
import HOURS_ESTIMATE_FIELD from '@salesforce/schema/Recommended_Badge__c.Hours_Estimate__c';
import MINUTES_ESTIMATE_FIELD from '@salesforce/schema/Recommended_Badge__c.Minutes_Estimate__c';
import TRAIL_API_NAME_FIELD from '@salesforce/schema/Recommended_Trail__c.TrailAPIName__c';
import TRAIL_MIX_CATEGORY_FIELD from '@salesforce/schema/Recommended_Trail__c.Mix_Category__c';
import TRAIL_NAME_FIELD from '@salesforce/schema/Recommended_Trail__c.TrailName__c';

import getTrailheadEntitiesByApiName from '@salesforce/apex/TrailheadEntityFormController.getTrailheadEntitiesByAPIName';

const BADGE_FIELDS = [
    {fieldApiName: BADGE_MIX_CATEGORY_FIELD.fieldApiName, key: `${BADGE_MIX_CATEGORY_FIELD.objectApiName}.${BADGE_MIX_CATEGORY_FIELD.fieldApiName}`},
    {fieldApiName: HOURS_ESTIMATE_FIELD.fieldApiName, key: `${HOURS_ESTIMATE_FIELD.objectApiName}.${HOURS_ESTIMATE_FIELD.fieldApiName}`},
    {fieldApiName: MINUTES_ESTIMATE_FIELD.fieldApiName, key: `${MINUTES_ESTIMATE_FIELD.objectApiName}.${MINUTES_ESTIMATE_FIELD.fieldApiName}`},
    {fieldApiName: CATEGORY_RANK_FIELD.fieldApiName, key: `${CATEGORY_RANK_FIELD.objectApiName}.${CATEGORY_RANK_FIELD.fieldApiName}`},
    {fieldApiName: HIGH_PRIORITY_FIELD.fieldApiName, key: `${HIGH_PRIORITY_FIELD.objectApiName}.${HIGH_PRIORITY_FIELD.fieldApiName}`}
]

const TRAIL_FIELDS = [
    {fieldApiName: TRAIL_MIX_CATEGORY_FIELD.fieldApiName, key: `${TRAIL_MIX_CATEGORY_FIELD.objectApiName}.${TRAIL_MIX_CATEGORY_FIELD.fieldApiName}`},
]

/* eslint-disable new-cap */
export default class TrailheadEntityForm extends NavigationMixin(LightningElement) {
    cardTitle;
    objectApiName;
    @track recordFields;
    @api recordId;
    saveAndNew = false;
    selectedName;
    selectedApiName;

    lookupObjectName;
    lookupPlaceholder;
    lookupResultIconName;
    lookupItems = [];
    selectedLookupId;

    get sObjectName() {
        return this.objectApiName;
    }
    @api
    set sObjectName(value) {
        if(this.objectApiName !== value) {
            this.objectApiName = value;
            /* eslint-disable default-case */
            switch(value) {
                case 'Recommended_Badge__c':
                    this.cardTitle = 'New Recommended Badge';
                    this.recordFields = BADGE_FIELDS;
                    this.lookupObjectName = 'Badge';
                    this.lookupPlaceholder = 'Search Badges...';
                    this.lookupResultIconName = 'custom:custom48';
                    break;
                case 'Recommended_Trail__c':
                    this.cardTitle = 'New Recommended Trail';
                    this.recordFields = TRAIL_FIELDS;
                    this.lookupObjectName = 'Trail';
                    this.lookupPlaceholder = 'Search Trails...';
                    this.lookupResultIconName = 'custom:custom64';
                    break;
            }
        }
    }

    @wire(getTrailheadEntitiesByApiName, { childEntityType: '$objectApiName'})
    parseTrailheadEntitiesByApiName({error, data}) {
        if(data) {
            this.lookupItems = [...data];
        } else if(error) {
            this.refs.errorHandler.handleError(error);
        }
    }

    handleLookupSelect(event) {
        this.selectedName = event.detail.Name;
        this.selectedApiName = event.detail.Id;
    }
    
    /* eslint-disable class-methods-use-this, @lwc/lwc/no-unsupported-ssr-properties, @lwc/lwc/no-restricted-browser-globals-during-ssr */
    handleCancel() {
        window.history.back();
    }

    handleLoad(event) {
        /* eslint-disable no-magic-numbers */
        const record = event.detail.record ?? Object.values(event.detail.records)[0];
        switch(this.objectApiName) {
            case 'Recommended_Badge__c':
                this.selectedLookupId = record.fields[BADGE_API_NAME_FIELD.fieldApiName].value;
                break;
            case 'Recommended_Trail__c':
                this.selectedLookupId = record.fields[TRAIL_API_NAME_FIELD.fieldApiName].value;
                break;
        }
    }

    handleSave() {
        this.saveAndNew = false;
    }

    handleSaveAndNew() {
        this.saveAndNew = true;
    }

    handleSuccess(event) {
        if(this.saveAndNew) {
            const inputFields = this.template.querySelectorAll('lightning-input-field');
            inputFields.forEach(inputField => inputField.reset());
            this.refs.lookup.reset();
            /* eslint-disable sort-keys, @lwc/lwc/no-unsupported-ssr-properties, @lwc/lwc/no-restricted-browser-globals-during-ssr */
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: `${event.detail.fields.Name.value} was saved.`,
                variant: 'success'
            }))
        } else {
            /* eslint-disable sort-keys */
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    actionName: 'view',
                    recordId: event.detail.id
                }
            });
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        const { fields } = event.detail;
        switch(this.objectApiName) {
            case 'Recommended_Badge__c':
                fields[BADGE_API_NAME_FIELD.fieldApiName] = this.selectedApiName;
                fields[BADGE_NAME_FIELD.fieldApiName] = this.selectedName;
                break;
            case 'Recommended_Trail__c':                
                fields[TRAIL_API_NAME_FIELD.fieldApiName] = this.selectedApiName;
                fields[TRAIL_NAME_FIELD.fieldApiName] = this.selectedName;
                break;
        }
        this.refs.editForm.submit(fields);
    }
}