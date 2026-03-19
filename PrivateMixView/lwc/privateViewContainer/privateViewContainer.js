/* eslint-disable sort-imports, one-var, @lwc/lwc/no-async-await, @lwc/lwc/no-for-of */
import { LightningElement, api, track } from 'lwc';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { deleteRecord, updateRecord } from 'lightning/uiRecordApi';

import BADGE_NAME_FIELD from '@salesforce/schema/Recommended_Badge__c.BadgeName__c';
import HIGH_PRIORITY_FIELD from '@salesforce/schema/Recommended_Badge__c.High_Priority__c';
import HIGH_PRIORITY_ID_FIELD from '@salesforce/schema/Recommended_Badge__c.High_Priority_Id__c';
import BADGE_ID_FIELD from '@salesforce/schema/Recommended_Badge__c.Id';
import MIX_CATEGORY_FIELD from '@salesforce/schema/Recommended_Badge__c.Mix_Category__c';
import TIME_ESTIMATE_FIELD from '@salesforce/schema/Recommended_Badge__c.Time_Estimate__c';
import TYPE_FIELD from '@salesforce/schema/Recommended_Badge__c.Type__c';
import URL_FIELD from '@salesforce/schema/Recommended_Badge__c.URL__c';

import MIX_CATEGORY_NAME_FIELD from '@salesforce/schema/Mix_Category__c.Name';
import MIX_CATEGORY_ID_FIELD from '@salesforce/schema/Mix_Category__c.Id';

import RECOMMENDED_BADGE_MIX_FIELD from '@salesforce/schema/Mix_Category__c.Recommended_Badge_Mix__c';
import RECOMMENDED_BADGE_MIX_NAME_FIELD from '@salesforce/schema/Recommended_Badge_Mix__c.Name';
import PRIVATE_MIX_FIELD from '@salesforce/schema/Recommended_Badge_Mix__c.Private_Mix__c';

import getMixCategoryData from '@salesforce/apex/PrivateViewController.getMixCategoryData';
import getPrivateMixRecommendedBadges from '@salesforce/apex/PrivateViewController.getPrivateMixRecommendedBadges';

const CHANGE_MIX_CATEGORY = 'Change Mix Category';
const DELETE_RECOMMENDED_BADGE = 'Delete Recommended Badge';
const DROPDOWN_VIEW_LABEL = 'Select View';
const TOGGLE_HIGH_PRIORITY = 'Toggle High Priority';

const ACTIONS = [
    {
        label: DELETE_RECOMMENDED_BADGE,
        name: DELETE_RECOMMENDED_BADGE
    },
    {
        label: CHANGE_MIX_CATEGORY,
        name: CHANGE_MIX_CATEGORY
    },
    {
        label: TOGGLE_HIGH_PRIORITY,
        name: TOGGLE_HIGH_PRIORITY
    }
]

const HIGH_PRIORITY_OPTION = {
    label: 'High Priority',
    value: 'High Priority'
};
const HIGH_PRIORITY_PREFIX = 'HP';
const LOOKUP_OBJECT_NAME = 'Mix Category';
const PROMPT_HEADER = 'Change Mix Category';
const RESULT_ICON_NAME = 'custom:custom46';
const SPINNER_TEXT = 'Retrieving badges';

/* eslint-disable sort-keys */
const TABLE_COLUMNS = [
    {
        type: 'hyperlinkWithIcon',
        label: 'Badge',
        typeAttributes: {
            label: { fieldName: BADGE_NAME_FIELD.fieldApiName },
            url: { fieldName: URL_FIELD.fieldApiName },
            icons: { fieldName: 'icons' }
        }
    },
    {
        label: 'Type',
        fieldName: TYPE_FIELD.fieldApiName
    },
    {
        label: 'Time Estimate',
        fieldName: TIME_ESTIMATE_FIELD.fieldApiName
    },
    {
        type: 'action',
        typeAttributes: {
            rowActions: ACTIONS
        }
    }
]

export default class PrivateViewContainer extends LightningElement {
    @api divClasses;
    displayPrompt = false;
    disableChangeMixCategorySave = true;
    dropdownViewLabel = DROPDOWN_VIEW_LABEL;
    dropdownViewValue = 'High Priority';
    isLoading = true;
    keyField = HIGH_PRIORITY_ID_FIELD.fieldApiName;
    lookupItems;
    lookupObjectName = LOOKUP_OBJECT_NAME;
    lookupResultIconName = RESULT_ICON_NAME;
    mixCategoryData;
    promptHeader = PROMPT_HEADER;
    promptIsLoading;
    @track recommendedBadgeData;
    selectedRecommendedBadge;
    spinnerText = SPINNER_TEXT;
    tableColumns = TABLE_COLUMNS;
    @track tableData;
    viewOptions;

    async connectedCallback() {
        try {
            this.mixCategoryData = await getMixCategoryData();
            this.populateViewOptions();
            this.populateRecommendedBadgeData();
            this.isLoading = false;
        } catch(err) {
            this.template.querySelector('c-error').handleError(err);
        }
    }

    populateLookupItems() {
        this.lookupItems = [];
        this.mixCategoryData.forEach((mixCategory) => {
            if(this.selectedRecommendedBadge.Mix_Category__c !== mixCategory.Id) {
                /* eslint-disable sort-keys */
                this.lookupItems.push({
                    Id: mixCategory[MIX_CATEGORY_ID_FIELD.fieldApiName],
                    Name: mixCategory[MIX_CATEGORY_NAME_FIELD.fieldApiName],
                    SecondaryFieldValue: mixCategory.Recommended_Badge_Mix__r[RECOMMENDED_BADGE_MIX_NAME_FIELD.fieldApiName],
                    ParentId: mixCategory[RECOMMENDED_BADGE_MIX_FIELD.fieldApiName]
                });
            }
        });
    }

    populateViewOptions() {
        const viewOptions = [HIGH_PRIORITY_OPTION];
        for(const mixCategory of this.mixCategoryData) {
            if(mixCategory.Recommended_Badge_Mix__r[PRIVATE_MIX_FIELD.fieldApiName]) {
                viewOptions.push({
                    label: mixCategory[MIX_CATEGORY_NAME_FIELD.fieldApiName],
                    value: mixCategory[MIX_CATEGORY_NAME_FIELD.fieldApiName]
                });
            }
        }
        this.viewOptions = viewOptions;
    }

    handleDropdownChange(event) {
        if(event.detail === 'High Priority') {
            this.keyField = HIGH_PRIORITY_ID_FIELD.fieldApiName;
        } else {
            this.keyField = BADGE_ID_FIELD.fieldApiName;
        }

        this.dropdownViewValue = event.detail;
        this.tableData = this.recommendedBadgeData[event.detail];
    }

    handleRowAction(event) {
        /* eslint-disable default-case */
        switch(event.detail.action.name) {
            case CHANGE_MIX_CATEGORY:
                this.selectedRecommendedBadge = event.detail.row;
                this.populateLookupItems();
                this.displayPrompt = true;
                break;
            case DELETE_RECOMMENDED_BADGE:
                this.handleDelete(event.detail.row);
                break;
            case TOGGLE_HIGH_PRIORITY:
                this.toggleHighPriority(event.detail.row);
                break;
        }
    }

    /* eslint-disable init-declarations */
    async toggleHighPriority(rowToToggle) {
        this.isLoading = true;
        const newHighPriorityValue = !(this.dropdownViewValue === 'High Priority');
        const recordInput = {
            fields : {
                [BADGE_ID_FIELD.fieldApiName]: rowToToggle.Id.replace(HIGH_PRIORITY_PREFIX, ''),
                [HIGH_PRIORITY_FIELD.fieldApiName]: newHighPriorityValue
            }
        };

        try {
            await updateRecord(recordInput);
            this.populateRecommendedBadgeData();

            /* eslint-disable sort-keys */
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: `Set High Priority for ${rowToToggle[BADGE_NAME_FIELD.fieldApiName]} recommended badge to ${newHighPriorityValue}.`,
                variant: 'success'
            }));
        } catch(err) {
            this.template.querySelector('c-error').handleError(err);
        }

        this.isLoading = false;
    }

    async handleDelete(rowToDelete) {
        this.isLoading = true;
        
        try {
            await deleteRecord(rowToDelete.Id.replace(HIGH_PRIORITY_PREFIX, ''));
            this.populateRecommendedBadgeData();

            /* eslint-disable sort-keys */
            const showToastEvent = new ShowToastEvent({
                title: 'Success',
                message: `Deleted ${rowToDelete[BADGE_NAME_FIELD.fieldApiName]} recommended badge.`,
                variant: 'success'
            });
            this.dispatchEvent(showToastEvent);
        } catch(err) {
            this.template.querySelector('c-error').handleError(err);
        }

        this.isLoading = false;
    }

    handlePromptClose() {
        this.displayPrompt = false;
    }

    async handlePromptConfirm() {
        this.promptIsLoading = true;
        const selectedMixCategory = this.template.querySelector('c-lookup').selectedItem;
        /* eslint-disable camelcase */
        const recordInput = {
            fields: {
                [BADGE_ID_FIELD.fieldApiName]: this.selectedRecommendedBadge[BADGE_ID_FIELD.fieldApiName],
                [MIX_CATEGORY_FIELD.fieldApiName]: selectedMixCategory[MIX_CATEGORY_ID_FIELD.fieldApiName]
            }
        };

        try {
            await updateRecord(recordInput);
            this.populateRecommendedBadgeData(); 
            this.promptIsLoading = false;
            this.displayPrompt = false;

            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: `Changed Mix Category for ${this.selectedRecommendedBadge[BADGE_NAME_FIELD.fieldApiName]} to ${selectedMixCategory[MIX_CATEGORY_NAME_FIELD.fieldApiName]}.`,
                variant: 'success'
            }));
        } catch(err) {
            this.template.querySelector('c-error').handleError(err);
        }
    }

    handleMixCategorySelect() {
        this.disableChangeMixCategorySave = false;
    }

    handleMixCategorySelectionCleared() {
        this.disableChangeMixCategorySave = true;
    }

    async populateRecommendedBadgeData() {
        const privateBadgesByCategory = await getPrivateMixRecommendedBadges();
        const mappedPrivateBadgesByCategory = {};
        for(const category in privateBadgesByCategory) {
            mappedPrivateBadgesByCategory[category] = privateBadgesByCategory[category].map(badge => {
                if(badge[HIGH_PRIORITY_ID_FIELD.fieldApiName]) {
                    return {
                        ...badge,
                        icons: [
                            {
                                iconName: 'utility:priority',
                                alternativeText: 'High Priority'
                            }
                        ]
                    }
                }
                return badge;
            });
        }
        this.recommendedBadgeData = mappedPrivateBadgesByCategory;
        if(this.recommendedBadgeData) {
            this.tableData = this.recommendedBadgeData[this.dropdownViewValue];
        }
    }
}