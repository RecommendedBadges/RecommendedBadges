import LightningTreeGrid from 'lightning/treeGrid';
import internalUrlTemplate from './internalUrlColumn.html';

export default class Treegrid extends LightningTreeGrid {
    static customTypes = {
        internalUrl: {
            template: internalUrlTemplate,
            typeAttributes: ['label', 'url', 'id'],
            standardCellLayout: true
        }
    };
}