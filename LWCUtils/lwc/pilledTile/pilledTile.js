import { LightningElement, api } from 'lwc';


export default class PilledTile extends LightningElement {
    @api pills;

    get iconName() {
        return this.pills?.filter(p => p.name === 'Blog Post').length > 0 ?
            'utility:notebook' : this.pills?.filter(p => p.name === 'YouTube Playlist').length > 0 ?
            'utility:video' : 'utility:page';
    }
}