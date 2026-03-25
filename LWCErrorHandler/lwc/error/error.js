/* eslint-disable one-var, sort-imports */
import { LightningElement, api, wire } from 'lwc';

import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';

import Toast from 'lightning/toast';
import ToastContainer from 'lightning/toastContainer';

import PROFILE_ID_FIELD from '@salesforce/schema/User.ProfileId';
import PROFILE_NAME_FIELD from '@salesforce/schema/User.Profile.Name';

import USER_ID from '@salesforce/user/Id';

import ErrorModal from 'c/errorModal';

const ERROR_VARIANT = 'error';
const ERROR_MODAL_DESCRIPTION = 'Displays error message';
const ERROR_MODAL_LABEL = 'Error Modal';
const ERROR_MODAL_SIZE = 'small';
const EXPERIENCE_PAGE_TYPE_PREFIX = 'comm__';
const SAVE_METHOD = 'EVENT_BUS';
const SYSTEM_ADMINISTRATOR_PROFILE = 'System Administrator';

export default class Error extends LightningElement {
    @api admProfiles = [SYSTEM_ADMINISTRATOR_PROFILE];
    @api displayModal;
    @api errorModalSize = ERROR_MODAL_SIZE;
    @api saveMethod = SAVE_METHOD;
    error;
    sysAdminView;
    toastContainer;

    @wire(CurrentPageReference)
    pageRef;

    /* eslint-disable sort-keys */
    @wire(getRecord, {recordId: `${USER_ID}`, fields: [PROFILE_ID_FIELD, PROFILE_NAME_FIELD]})
    parseRecord({error, data}) {
        if(error) {
            this.handleError(error);
        } else if(data) {
            /* eslint-disable no-magic-numbers */
            if(this.admProfiles.indexOf(data.fields.Profile.displayValue) !== -1) {
                this.sysAdminView = true;
            }
        }
    }

    connectedCallback() {
        this.toastContainer = ToastContainer.instance();
    }

    @api handleError(error, displayModal) {
        this.logError(error);
        if(this.sysAdminView || displayModal) {
            this.openModal(error);
        } else {
            this.displayErrorToast(error);
        }
    }

    displayErrorToast(error) {
        if(this.pageRef.type.startsWith(EXPERIENCE_PAGE_TYPE_PREFIX)) {
            Toast.show({
                variant: ERROR_VARIANT,
                message: error.body?.message,
                label: error.body?.exceptionType
            }, this);
        } else {
            /* eslint-disable sort-keys */
            this.dispatchEvent(new ShowToastEvent({
                variant: ERROR_VARIANT,
                message: error.body.message,
                title: error.body.exceptionType
            }));
        }
    }

    logError(error) {
        const logger = this.refs.logger;
        logger.error(error.message).setError(error);
        logger.saveLog(this.saveMethod);
    }

    /* eslint-disable @lwc/lwc/no-async-await */
    async openModal(error) {
        this.error = {
            exceptionType: error.body.exceptionType,
            message: error.body.message
        };
        if(this.sysAdminView) {
            this.error.stackTrace = error.body.stackTrace;
        }
        await ErrorModal.open({
            label: ERROR_MODAL_LABEL,
            description: ERROR_MODAL_DESCRIPTION,
            size: this.errorModalSize,
            error: this.error,
            sysAdminView: this.sysAdminView
        });
    }
}