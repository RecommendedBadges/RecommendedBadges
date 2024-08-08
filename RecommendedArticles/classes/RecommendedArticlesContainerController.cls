/**
 * Apex controller for recommendedArticlesContainer component
 * @author Ben Learn
 * @since 08-05-2024
 * @group RecommendedArticles
 */
public without sharing class RecommendedArticlesContainerController {
    /**
     * Returns all RecommendedArticle__c records along with the names of related Topics
     * @return  `List<RecommendedArticle__c>`
     */    
    @AuraEnabled(cacheable=true)
    public static List<RecommendedArticle__c> getRecommendedArticles() {
        return new RecommendedArticlesSelector().selectAllWithTopics();
    }

    /**
     * Returns all Topics that have an TopicAssignment related to a RecommendedArticle__c record.
     * @return  `List<Topic>`
     */    
    @AuraEnabled(cacheable=true)
    public static List<Topic> getTopics() {
        return new TopicsSelector().selectAllTaggingRecommendedArticles();
    }
}