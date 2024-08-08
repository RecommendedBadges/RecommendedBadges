@isTest
private class RecommendedArticlesContainerCntlr_Tests {
    @testSetup
    private static void generateData() {       
        TopicTS topicGenerator = new TopicTS(new Map<String, Object>{'numberToGenerate' => 19, 'generateRecordIDs' => false});
        insert topicGenerator.generate();
    }

    @isTest
    private static void getRecommendedArticles_test() {        
        RecommendedArticleTS articleGenerator = new RecommendedArticleTS(new Map<String, Object>{'numberToGenerate' => 100, 'generateRecordIDs' => false});
        insert articleGenerator.generate();
        Map<Id, RecommendedArticle__c> articleMap = new Map<Id, RecommendedArticle__c>((List<RecommendedArticle__c>) articleGenerator.records);

        TopicAssignmentTS topicAssignmentGenerator = new TopicAssignmentTS(
            new Map<String, Object>{'generateRecordIDs' => false},
            new List<TestSupport.TestDataField>{
                new RelationshipField(TopicAssignment.TopicId, (new Map<Id, Topic>([SELECT Id FROM Topic])).keySet()),
                new RelationshipField(TopicAssignment.EntityId, articleMap.keySet())
            }
        );
        insert topicAssignmentGenerator.generate();
        Map<Id, TopicAssignment> topicAssignmentMap = new Map<Id, TopicAssignment>((List<TopicAssignment>) topicAssignmentGenerator.records);

        Test.startTest();
        List<RecommendedArticle__c> actualArticles = RecommendedArticlesContainerController.getRecommendedArticles();
        Test.stopTest();

        Assert.areEqual(articleMap.keySet(), (new Map<Id, RecommendedArticle__c>(actualArticles)).keySet(), 'Expected all recommended articles to be returned.');
        for(RecommendedArticle__c a : actualArticles) {
            for(TopicAssignment ta : a.TopicAssignments) {
                Assert.areEqual(topicAssignmentMap.get(ta.Id).EntityId, a.Id, 'Expected Topic Assignment to be related to current Recommended Article.');
            }
        }
    }

    @isTest
    private static void getTopics_test() {
        RecommendedArticleTS articleGenerator = new RecommendedArticleTS(new Map<String, Object>{'numberToGenerate' => 100, 'generateRecordIDs' => false});
        insert articleGenerator.generate();

        TopicAssignmentTS topicAssignmentGenerator = new TopicAssignmentTS(
            new Map<String, Object>{'generateRecordIDs' => false},
            new List<TestSupport.TestDataField>{
                new RelationshipField(TopicAssignment.TopicId, (new Map<Id, Topic>([SELECT Id FROM Topic])).keySet()),
                new RelationshipField(TopicAssignment.EntityId, (new Map<Id, RecommendedArticle__c>((List<RecommendedArticle__c>) articleGenerator.records)).keySet())
            }
        );
        insert topicAssignmentGenerator.generate();

        Test.startTest();
        List<Topic> actualTopics = RecommendedArticlesContainerController.getTopics();
        Test.stopTest();
        
        Assert.areEqual(new Set<Topic>([SELECT Id, Name FROM Topic]), new Set<Topic>(actualTopics), 'Expected Topics tagging Recommended Articles to be returned.');
    }
}