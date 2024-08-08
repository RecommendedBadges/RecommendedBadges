/**
 * Selector class for Topic standard object.
 * @author Ben Learn
 * @since 08-05-2024
 * @group RecommendedArticles
 */
public inherited sharing class TopicsSelector extends ApplicationSelector {
    /**
     * fflib method to hold the fields to always be queried by the selector
     * @return  `List<Schema.SObjectField>`
     */
    public List<Schema.SObjectField> getSObjectFieldList() {
        return new List<Schema.SObjectField> {
            Topic.Id,
            Topic.Name
        };
    }

    /**
     * fflib method to return the sObjectType of the object being queried
     * @return  `Schema.SObjectType`
     */   
    public Schema.SObjectType getSObjectType() {
        return Topic.sObjectType;
    }

    /**
     * returns all Topics that have a TopicAssignment related to a RecommendedArticle__c record
     * @return  `List<Topic>`
     */    
    public List<Topic> selectAllTaggingRecommendedArticles() {
        return (List<Topic>) Database.query(newQueryFactory()
            .setCondition('Id IN (SELECT TopicId FROM TopicAssignment WHERE EntityType = \'RecommendedArticle__c\')')
            .addOrdering(Topic.Name, fflib_QueryFactory.SortOrder.ASCENDING)
            .toSOQL()
        );
    }
}