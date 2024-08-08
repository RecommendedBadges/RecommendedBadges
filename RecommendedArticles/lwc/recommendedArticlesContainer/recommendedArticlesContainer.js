import { LightningElement, track, wire } from 'lwc';

import getRecommendedArticles from '@salesforce/apex/RecommendedArticlesContainerController.getRecommendedArticles';
import getTopics from '@salesforce/apex/RecommendedArticlesContainerController.getTopics';

export default class RecommendedArticlesContainer extends LightningElement {
    @track currentArticles = [];
    currentFilters = [];
    recommendedArticles = [];
    topics = [];

    @wire(getRecommendedArticles)
    parseRecommendedArticles({error, data}) {
        if(data) {
            /* eslint-disable sort-keys, no-ternary */
            this.recommendedArticles = data.map(ra => ({
                id: ra.Id,
                name: ra.Name,
                title: ra.Title__c,
                url: ra.URL__c,
                topics: ra.TopicAssignments ? ra.TopicAssignments.map(ta => ({
                    id: ta.Id,
                    topicId: ta.TopicId,
                    name: ta.Topic.Name
                })) : null
            }));
            this.currentArticles = this.recommendedArticles;
        } else if(error) {
            this.template.querySelector('c-error').handleError(error);
        }
    }

    @wire(getTopics)
    parseTopics({error, data}) {
        if(data) {
            this.topics = data.map(topic => ({
                label: topic.Name,
                value: topic.Name
            }));
        } else if(error) {
            this.template.querySelector('c-error').handleError(error);
        }
    }

    handleFilterChange(event) {
        const { type: eventType, filter: changedFilterValue } = event.detail;

        // eslint-disable-next-line default-case
        switch(eventType) {
            case 'add':
                this.currentFilters.push(changedFilterValue);
                break;
            case 'remove':
                // eslint-disable-next-line id-length
                this.currentFilters = this.currentFilters.filter(f => f !== changedFilterValue);
                break;
        }
        this.filterArticles(eventType, changedFilterValue);
    }

    filterArticles(eventType, changedFilterValue) {
        let filteredArticles = [];

        // eslint-disable-next-line default-case
        switch(eventType) {
            case 'add':
                filteredArticles = this.currentArticles.filter(article => {
                    if(!article.topics) {
                        return false;
                    }

                    // eslint-disable-next-line @lwc/lwc/no-for-of
                    for(const topic of article.topics) {
                        if(topic.topicName === changedFilterValue) {
                            return true;
                        }
                    }
                    return false;
                });
                break;
            case 'remove':
                // eslint-disable-next-line no-magic-numbers
                if(this.currentFilters.length === 0) {
                    filteredArticles = this.recommendedArticles;
                } else {
                    filteredArticles = this.recommendedArticles.filter(article => {
                        const topicNames = article.topics?.map(topic => topic.topicName);
                        
                        // eslint-disable-next-line no-magic-numbers
                        return this.currentFilters.filter(cf => topicNames?.includes(cf) !== true).length === 0;
                    });
                }
                break;
        }
        this.currentArticles = filteredArticles;
    }
}