import { LightningElement, wire, api } from 'lwc';

import { CurrentPageReference } from 'lightning/navigation';

const EXPERIENCE_SITE_PAGE_TYPE = 'comm__namedPage';

export default class InternalUrl extends LightningElement {
    @api id;
    isExperienceSite = false;
    @api excludedKeyPrefixes = [];
    @api label;
    pageRef;
    @api url;

    get renderUrl() {
        return !this.isExperienceSite || !this.excludedKeyPrefixes.includes(this.id?.substring(0, 3));
    }

    @wire(CurrentPageReference)
    parsePageRef(pageRef) {
        try {
            this.pageRef = pageRef;
            this.isExperienceSite = pageRef.type === EXPERIENCE_SITE_PAGE_TYPE;
        } catch(error) {
            this.refs.errorHandler.handleError(error);
        }
    }
}