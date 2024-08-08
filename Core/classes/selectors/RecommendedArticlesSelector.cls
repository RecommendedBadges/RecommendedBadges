/**
 * Selector class for RecommendedArticle__c object
 * @author Ben Learn
 * @since 08-06-2024
 * @group Core
 */
public inherited sharing class RecommendedArticlesSelector extends ApplicationSelector {
    /**
     * fflib method to hold the fields to always be queried by the selector
     * @return  `List<Schema.SObjectField>`
     */
    public List<Schema.SObjectField> getSObjectFieldList() {
        return new List<Schema.SObjectField>{
            RecommendedArticle__c.Id,
            RecommendedArticle__c.Name,
            RecommendedArticle__c.Title__c,
            RecommendedArticle__c.URL__c
        };
    }

    /**
     * fflib method to return the sObjectType of the object being queried
     * @return  `Schema.SObjectType`
     */     
    public Schema.SObjectType getSObjectType() {
        return RecommendedArticle__c.sObjectType;
    }

    /**
     * returns all RecommendedArticle__c along with the names of all related Topics
     * @return  `List<RecommendedArticle__c>`
     */    
    public List<RecommendedArticle__c> selectAllWithTopics() {
        fflib_QueryFactory articlesQueryFactory = newQueryFactory();

        String relationshipName;
        List<Schema.ChildRelationship> articlesChildRelationships = Schema.SObjectType.RecommendedArticle__c.getChildRelationships();
        for(Schema.ChildRelationship childRelationship : articlesChildRelationships) {
            if(childRelationship.getChildSObject() == TopicAssignment.sObjectType) {
                relationshipName = childRelationship.getRelationshipName();
                break;
            }
        }

        fflib_QueryFactory topicAssignmentsSubQueryFactory = new TopicAssignmentsSelector().addQueryFactorySubselect(articlesQueryFactory, relationshipName)
            .selectField('Topic.Id')
            .selectField('Topic.Name');
        
        return (List<RecommendedArticle__c>) Database.query(articlesQueryFactory.toSOQL());
    }
}