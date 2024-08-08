@isTest(IsParallel=true)
private class TopicsSelector_Tests {
    @isTest
    private static void getSObjectFieldList_test() {
        List<Schema.SObjectField> expectedFieldList = new List<Schema.SObjectField> {
            Topic.Id,
            Topic.Name
        };

        Assert.areEqual(expectedFieldList, new TopicsSelector().getSObjectFieldList(), SelectorTestErrorMessages.SOBJECT_FIELD_LIST_ERROR_MESSAGE);
    }

    @isTest
    private static void getSObjectType_test() {
        Assert.areEqual(Topic.sObjectType, new TopicsSelector().getSObjectType(), SelectorTestErrorMessages.SOBJECT_TYPE_ERROR_MESSAGE);
    }

    @isTest
    private static void selectAllTaggingRecommendedArticles_Test() {
        TopicTS topicGenerator = new TopicTS(new Map<String, Object>{'numberToGenerate' => 20, 'generateRecordIDs' => false});
        List<Topic> topics = (List<Topic>) topicGenerator.generate();
        insert topics;

        // get a random 9 of the 20 topics
        List<Topic> expectedTopics = new List<Topic>();
        for(Integer i = 0; i < 9; i++) {
            expectedTopics.add(topics.remove(Integer.valueOf(Math.floor(Math.random() * topics.size()))));
        }

        RecommendedArticleTS articleGenerator = new RecommendedArticleTS(new Map<String, Object>{'numberToGenerate' => 100, 'generateRecordIDs' => false});
        insert articleGenerator.generate();

        TopicAssignmentTS topicAssignmentGenerator = new TopicAssignmentTS(
            new Map<String, Object>{'generateRecordIDs' => false},
            new List<TestSupport.TestDataField>{
                new RelationshipField(TopicAssignment.TopicId, (new Map<Id, Topic>(expectedTopics)).keySet()),
                new RelationshipField(TopicAssignment.EntityId, (new Map<Id, RecommendedArticle__c>((List<RecommendedArticle__c>) articleGenerator.records)).keySet())
            }
        );
        insert topicAssignmentGenerator.generate();

        Test.startTest();
        List<Topic> actualTopics = new TopicsSelector().selectAllTaggingRecommendedArticles();
        Test.stopTest();
        
        Assert.areEqual(new Set<Topic>(expectedTopics), new Set<Topic>(actualTopics), 'Expected Topics tagging Recommended Articles to be returned.');
    }
}