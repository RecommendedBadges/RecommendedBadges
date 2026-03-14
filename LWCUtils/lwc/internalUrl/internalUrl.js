import { LightningElement, wire, api } from 'lwc';

import { CurrentPageReference } from 'lightning/navigation';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import MIX_CATEGORY_OBJECT from '@salesforce/schema/Mix_Category__c';

const EXPERIENCE_SITE_PAGE_TYPE = 'comm__namedPage';

export default class InternalUrl extends LightningElement {
    @api id;
    isExperienceSite = false;
    keyPrefix;
    @api label;
    pageRef;
    @api url;

    get renderUrl() {
        return !this.isExperienceSite || !this.id?.startsWith(this.keyPrefix);
    }

    @wire(CurrentPageReference)
    parsePageRef(pageRef) {
        try {
            this.pageRef = pageRef;
            this.isExperienceSite = pageRef.type === EXPERIENCE_SITE_PAGE_TYPE;
        } catch(error) {
            this.template.querySelector('c-error').handleError(error);
        }
    }

    @wire(getObjectInfo, { objectApiName: MIX_CATEGORY_OBJECT })
    parseObjectInfo({ error, data }) {
        if(data) {
            this.keyPrefix = data.keyPrefix;
        } else if(error) {
            this.template.querySelector('c-error').handleError(error);
        }
    }
}