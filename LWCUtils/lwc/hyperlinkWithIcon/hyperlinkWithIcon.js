import { LightningElement, api } from 'lwc';

export default class HyperlinkWithIcon extends LightningElement {
    @api label;
    @api url;
    @api icons = [];
}