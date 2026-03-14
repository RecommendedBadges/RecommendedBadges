/* eslint-disable sort-imports, one-var, @lwc/lwc/no-for-of, no-underscore-dangle, no-ternary */
import { LightningElement, wire, track } from 'lwc';

import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

import getData from '@salesforce/apex/RecommendedBadgeMixController.getData';
import getSortOptions from '@salesforce/apex/SortCustomMetadataController.getSortOptions';

import { sortAlphabetic, sortCustom } from 'c/sortUtility';

import MIX_CATEGORY_ID_FIELD from '@salesforce/schema/Mix_Category__c.Id';
import MIX_CATEGORY_NAME_FIELD from '@salesforce/schema/Mix_Category__c.Name';
import MIX_CATEGORY_RECOMMENDED_BADGE_MIX_FIELD from '@salesforce/schema/Mix_Category__c.Recommended_Badge_Mix__c';

import RECOMMENDED_BADGE_OBJECT from '@salesforce/schema/Recommended_Badge__c';
import BADGE_ID_FIELD from '@salesforce/schema/Recommended_Badge__c.Id';
import BADGE_LEVEL_FIELD from '@salesforce/schema/Recommended_Badge__c.Level__c';
import BADGE_HYPERLINKEDNAME_FIELD from '@salesforce/schema/Recommended_Badge__c.HyperlinkedName__c';
import BADGE_NAME_FIELD from '@salesforce/schema/Recommended_Badge__c.BadgeName__c';
import RECOMMENDED_BADGE_NAME_FIELD from '@salesforce/schema/Recommended_Badge__c.Name';
import BADGE_TYPE_FIELD from '@salesforce/schema/Recommended_Badge__c.Type__c';
import BADGE_URL_FIELD from '@salesforce/schema/Recommended_Badge__c.URL__c';

import TRAIL_ID_FIELD from '@salesforce/schema/Recommended_Trail__c.Id';
import TRAIL_LEVEL_FIELD from '@salesforce/schema/Recommended_Trail__c.Level__c';
import TRAIL_HYPERLINKEDNAME_FIELD from '@salesforce/schema/Recommended_Trail__c.HyperlinkedName__c';
import TRAIL_NAME_FIELD from '@salesforce/schema/Recommended_Trail__c.TrailName__c';
import RECOMMENDED_TRAIL_NAME_FIELD from '@salesforce/schema/Recommended_Trail__c.Name';
import TRAIL_URL_FIELD from '@salesforce/schema/Recommended_Trail__c.URL__c';

import RECOMMENDED_BADGE_MIX_OBJECT from '@salesforce/schema/Recommended_Badge_Mix__c';
import RECOMMENDED_BADGE_MIX_NAME_FIELD from '@salesforce/schema/Recommended_Badge_Mix__c.Name';
import RECOMMENDED_BADGE_MIX_FREE_SF_BEN_PRACTICE_EXAM_FIELD from '@salesforce/schema/Recommended_Badge_Mix__c.FreeSFBenPracticeExam__c';
import RECOMMENDED_BADGE_MIX_LAST_UPDATED_DATE_FIELD from '@salesforce/schema/Recommended_Badge_Mix__c.Last_Updated_Date__c';
import RECOMMENDED_BADGE_MIX_OFFICIAL_EXAM_GUIDE_FIELD from '@salesforce/schema/Recommended_Badge_Mix__c.OfficialExamGuide__c';
import RECOMMENDED_BADGE_MIX_OFFICIAL_EXAM_TRAILMIX_FIELD from '@salesforce/schema/Recommended_Badge_Mix__c.OfficialExamTrailmix__c';
import RECOMMENDED_BADGE_MIX_OFFICIAL_PRACTICE_EXAM_FIELD from '@salesforce/schema/Recommended_Badge_Mix__c.OfficialPracticeExam__c';
import RECOMMENDED_BADGE_MIX_RECORD_TYPE_ID_FIELD from '@salesforce/schema/Recommended_Badge_Mix__c.RecordTypeId';
//import RECOMMENDED_BADGE_MIX_FIELD from '@salesforce/schema/Mix_Category__c.Recommended_Badge_Mix__r';

const FILTER_ADD = 'add';
const FILTER_REMOVE = 'remove';
const LEVEL_FILTER = 'level';
const SPINNER_TEXT = 'Loading recommended badges...';
const TYPE_FILTER = 'type';

/* eslint-disable sort-keys */
const TREEGRID_COLUMNS = [
    {
        type: 'internalUrl',
        label: 'Name',
        typeAttributes: {
            id: { fieldName: BADGE_ID_FIELD.fieldApiName },
            label: { fieldName: RECOMMENDED_BADGE_NAME_FIELD.fieldApiName },
            url: { fieldName: BADGE_URL_FIELD.fieldApiName.replace('__c', '')}
        },
        initialWidth: 600
    },
    {
        fieldName: BADGE_TYPE_FIELD.fieldApiName.replace('__c', ''),
        label: 'Type',
        sortable: true
    },
    {
        fieldName: BADGE_LEVEL_FIELD.fieldApiName.replace('__c', ''),
        label: 'Level',
        sortable: true
    }
]

export default class RecommendedBadgeMixContainer extends LightningElement {
    badgeLevels;
    badgeMixesByName;
    badgeTypes;
    categoriesByBadgeMix;
    currentExpandedRows = [];
    currentLevelFilters = [];
    currentTypeFilters = [];
    defaultBadgeRecordTypeId;
    _displayExamResources = false;
    displayTable;
    @track filteredTreegridData;
    freeSFBenPracticeExam;
    _isExamMix = false;
    isLoading = true;
    currentLastUpdatedDate;
    keyField = BADGE_ID_FIELD.fieldApiName;
    mixLabel = 'Select Badge Mix';
    mixOptions;
    mixValue;
    officialExamGuide;
    officialExamTrailmix;
    officialPracticeExam;
    recordTypeNamesById;
    sortLabel = 'Sort By';
    sortOptions;
    sortValue;
    spinnerText = SPINNER_TEXT;
    treegridColumns = TREEGRID_COLUMNS;
    treegridData;
    treegridDataByMix;

    get displayExamResources() {
        if(this.isExamMix && this.isExperienceSite) {
            this.displayExamResources = true;
        } else {
            this.displayExamResources = false;
        }
        return this._displayExamResources;
    }
    set displayExamResources(value) {
        this._displayExamResources = value;
    }

    get isExamMix() {
        return this._isExamMix;
    }
    set isExamMix(badgeMixName) {
        // eslint-disable-next-line no-magic-numbers
        const recordTypeName = this.recordTypeNamesById[this.badgeMixesByName[badgeMixName][RECOMMENDED_BADGE_MIX_RECORD_TYPE_ID_FIELD.fieldApiName]];
        this._isExamMix = recordTypeName === 'Exam';
    }

    @wire(getObjectInfo, { objectApiName : RECOMMENDED_BADGE_MIX_OBJECT })
    parseRecommendedBadgeMixObjectInfo({error, data}) {
        if(data) {
            this.recordTypeNamesById = {};
            for(const recordTypeInfo of Object.values(data.recordTypeInfos)) {
                this.recordTypeNamesById[recordTypeInfo.recordTypeId] = recordTypeInfo.name;
            }
        } else if(error) {
            this.template.querySelector('c-error').handleError(error);
        }
    }

    @wire(getObjectInfo, { objectApiName : RECOMMENDED_BADGE_OBJECT })
    parseRecommendedBadgeObjectInfo({error, data}) {
        if(data) {
            this.defaultBadgeRecordTypeId = data.defaultRecordTypeId;
        } else if(error) {
            this.template.querySelector('c-error').handleError(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$defaultBadgeRecordTypeId', fieldApiName: BADGE_LEVEL_FIELD})
    parseBadgeLevels({error, data}) {
        if(data) {
            this.badgeLevels = [];
            data.values.forEach(value => (this.badgeLevels.push({label: value.label, value: value.value})));
        } else if(error) {
            this.template.querySelector('c-error').handleError(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$defaultBadgeRecordTypeId', fieldApiName: BADGE_TYPE_FIELD})
    parseBadgeTypes({error, data}) {
        if(data) {
            this.badgeTypes = [];
            data.values.forEach(value => (this.badgeTypes.push({label: value.label, value: value.value})));
        } else if(error) {
            this.template.querySelector('c-error').handleError(error);
        }
    }

    @wire(getData)
    parseData({error, data}) {
        if(data) {
            this.categoriesByBadgeMix = data.categoriesByBadgeMix;
            this.badgeMixesByName = data.badgeMixesByName;
            this.populateMixDropdown(data.defaultMix);
            this.parseTreegridData(data.defaultMix);
            this.currentLastUpdatedDate = this.badgeMixesByName[data.defaultMix][RECOMMENDED_BADGE_MIX_LAST_UPDATED_DATE_FIELD.fieldApiName];
            this.isExamMix = data.defaultMix;

            this.displayTable = true;
            this.isLoading = false;
        } else if(error) {
            this.template.querySelector('c-error').handleError(error);
        }
    }

    @wire(getSortOptions, {componentName: 'recommendedBadgeMixContainer'})
    parseSortOptions({error, data}) {
        if(data) {
            this.sortOptions = [];
            for(const option of data) {
                /* eslint-disable sort-keys */
                this.sortOptions.push({
                    label: option.MasterLabel,
                    value: option.MasterLabel,
                    sortableFieldValues: option.Sortable_Field_Values__r
                })   
            }
        } else if(error) {
            this.template.querySelector('c-error').handleError(error);
        }
    }

    renderedCallback() {
        if(this.treegridData && !this.displayTable) {
            this.displayTable = true;
        }

        if(this.isLoading && this.treegridData) {
            this.isLoading = false;
        }

        if(!this.refs.treegridContainer.classList.contains('slds-size_1-of-1') && !this.refs.treegridContainer.classList.contains('slds-size_5-of-6')) {
            this.refs.treegridContainer.classList.add((this.isExperienceSite ? 'slds-size_5-of-6' : 'slds-size_1-of-1'));
        }
    }

    populateMixDropdown(defaultMix) {
        const options = [];
        /* eslint-disable id-length */
        for(const a of Object.keys(this.categoriesByBadgeMix)) {
            options.push({label: a, value: a});
        }
        this.mixOptions = options;
        this.mixValue = defaultMix;
    }

    parseTreegridData(defaultMix) {
        this.treegridDataByMix = {};

        /* eslint-disable guard-for-in */
        for(const mix in this.categoriesByBadgeMix) {
            const extensibleMix = this.categoriesByBadgeMix[mix].map(item => {
                /* eslint-disable sort-keys, camelcase */                
                const newCategory = {
                    Id: item.mixCategory[MIX_CATEGORY_ID_FIELD.fieldApiName],
                    Name: item.mixCategory[MIX_CATEGORY_NAME_FIELD.fieldApiName],
                    URL: `/${item.mixCategory[MIX_CATEGORY_ID_FIELD.fieldApiName]}`,
                    _children: item.children,
                    Recommended_Badge_Mix__c: item.mixCategory[MIX_CATEGORY_RECOMMENDED_BADGE_MIX_FIELD.fieldApiName],
                };
                return newCategory;
            });

            this.treegridDataByMix[mix] = extensibleMix;
        }
        this.treegridData = this.treegridDataByMix[defaultMix];
        this.filteredTreegridData = this.treegridDataByMix[defaultMix];
    }

    handleClearFilters() {
        this.displayTable = false;
        this.isLoading = true;
        this.currentLevelFilters = [];
        this.currentTypeFilters = [];
        this.refs.levelFilterPanel.clearSelections();
        this.refs.typeFilterPanel.clearSelections();
        this.currentExpandedRows = this.refs.treegrid.getCurrentExpandedRows();
        this.filteredTreegridData = structuredClone(this.treegridData);
    }

    handleFilterChange(filterChange, filterField) {
        this.currentExpandedRows = this.refs.treegrid.getCurrentExpandedRows();
        this.displayTable = false;
        this.isLoading = true;
        const tempTreegridData = structuredClone(this.treegridData);

        this.updateCurrentFilters(filterField, filterChange.type, filterChange.filter);

        /* eslint-disable no-plusplus, no-magic-numbers */
        if(this.currentLevelFilters.length > 0) {
            tempTreegridData.forEach((element, index) => {
                tempTreegridData[index]._children = element._children.filter(badge => this.currentLevelFilters.includes(badge.Level));
            });
        }

        if(this.currentTypeFilters.length > 0) {
            tempTreegridData.forEach((element, index) => {
                tempTreegridData[index]._children = element._children.filter(badge => this.currentTypeFilters.includes(badge.Type));
            });
        }

        this.filteredTreegridData = tempTreegridData;
    }

    handleLevelFilterChange(event) {
        this.handleFilterChange(event.detail, LEVEL_FILTER);
    }

    handleTypeFilterChange(event) {
        this.handleFilterChange(event.detail, TYPE_FILTER);
    }

    handleMixChange(event) {
        this.isExamMix = event.detail;
        if(this.isExamMix) {
            this.freeSFBenPracticeExam = this.badgeMixesByName[event.detail][RECOMMENDED_BADGE_MIX_FREE_SF_BEN_PRACTICE_EXAM_FIELD.fieldApiName];
            this.officialExamGuide = this.badgeMixesByName[event.detail][RECOMMENDED_BADGE_MIX_OFFICIAL_EXAM_GUIDE_FIELD.fieldApiName];
            this.officialExamTrailmix = this.badgeMixesByName[event.detail][RECOMMENDED_BADGE_MIX_OFFICIAL_EXAM_TRAILMIX_FIELD.fieldApiName];
            this.officialPracticeExam = this.badgeMixesByName[event.detail][RECOMMENDED_BADGE_MIX_OFFICIAL_PRACTICE_EXAM_FIELD.fieldApiName];
        }
        this.currentLastUpdatedDate = this.badgeMixesByName[event.detail][RECOMMENDED_BADGE_MIX_LAST_UPDATED_DATE_FIELD.fieldApiName];
        this.treegridData = this.treegridDataByMix[event.detail];
        this.filteredTreegridData = this.treegridDataByMix[event.detail];
    }

    handleTreegridSort(event) {
        this.sort(event.detail.fieldName, event.detail.sortDirection);
    }

    handleSortChange(event) {
        this.sort(event.detail);
    }

    sort(fieldName, sortDirection) {
        this.sortDirection = sortDirection ?? 'asc';
        this.sortValue = fieldName;
        this.currentExpandedRows = this.refs.treegrid.getCurrentExpandedRows();
        const sortableFieldValues = this.sortOptions.find(option => (option.value === fieldName) && option.sortableFieldValues)?.sortableFieldValues.map(s => s.MasterLabel);
        const tempTreegridData = structuredClone(this.filteredTreegridData);

        for(const category of tempTreegridData) {
            /* eslint-disable no-magic-numbers */
            if(category._children.length > 1) {
                category._children = sortableFieldValues ? sortCustom(fieldName, category._children, sortableFieldValues, sortDirection) : sortAlphabetic(fieldName, category._children, sortDirection);
            }
        }
        this.filteredTreegridData = tempTreegridData;
    }

    handleExpandAll() {
        this.isLoading = true;
        this.refs.treegrid.expandAll();
    }

    handleCollapseAll() {
        this.isLoading = true;
        this.refs.treegrid.collapseAll();
    }

    updateCurrentFilters(filterField, filterChangeType, filterChangeFilter) {
        if(filterChangeType === FILTER_ADD) {
            if(filterField === LEVEL_FILTER) {
                this.currentLevelFilters.push(filterChangeFilter);
            } else if(filterField === TYPE_FILTER) {
                this.currentTypeFilters.push(filterChangeFilter);
            }
        } else if(filterChangeType === FILTER_REMOVE) {
            if(filterField === LEVEL_FILTER) {
                this.currentLevelFilters = this.currentLevelFilters.filter(f => f !== filterChangeFilter);
            } else if(filterField === TYPE_FILTER) {
                this.currentTypeFilters = this.currentTypeFilters.filter(f => f !== filterChangeFilter);
            }
        }
    }
}