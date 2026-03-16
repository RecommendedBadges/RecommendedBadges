@isTest
private class RecommendedArticlesSelector_Tests {
    @isTest
    private static void getSObjectFieldListTest() {
        List<Schema.SObjectField> expectedFieldList = new List<Schema.SObjectField> {
            RecommendedArticle__c.Id,
            RecommendedArticle__c.Name,
            RecommendedArticle__c.Site__c,
            RecommendedArticle__c.Title__c,
            RecommendedArticle__c.URL__c
        };

        Assert.areEqual(expectedFieldList, new RecommendedArticlesSelector().getSObjectFieldList(), SelectorTestErrorMessages.SOBJECT_FIELD_LIST_ERROR_MESSAGE);
    }

    @isTest
    private static void getSObjectTypeTest() {
        Assert.areEqual(RecommendedArticle__c.sObjectType, new RecommendedArticlesSelector().getSObjectType(), SelectorTestErrorMessages.SOBJECT_TYPE_ERROR_MESSAGE);
    }

    @isTest
    private static void selectAllWithTopicsTest() {
        User u = TestSupport.generateTestUser('test', 'test@test.com', 'TestName', 'System Administrator', 'test@aol.fake.com');
        insert u;
        PermissionSet corePermissions = [SELECT Id FROM PermissionSet WHERE Name = 'Core_Permissions'];
        insert new PermissionSetAssignment(AssigneeId = u.Id, PermissionSetId = corePermissions.Id);

        System.runAs(u) {
            TopicTS topicGenerator = new TopicTS(new Map<String, Object>{'numberToGenerate' => 19, 'generateRecordIDs' => false});
            insert topicGenerator.generate();

            RecommendedArticleTS articleGenerator = new RecommendedArticleTS(new Map<String, Object>{'numberToGenerate' => 100, 'generateRecordIDs' => false});
            insert articleGenerator.generate();
            Map<Id, RecommendedArticle__c> articleMap = new Map<Id, RecommendedArticle__c>((List<RecommendedArticle__c>) articleGenerator.records);

            TopicAssignmentTS topicAssignmentGenerator = new TopicAssignmentTS(
                new Map<String, Object>{'generateRecordIDs' => false},
                new List<TestSupport.TestDataField>{
                    new RelationshipField(TopicAssignment.TopicId, (new Map<Id, Topic>((List<Topic>) topicGenerator.records)).keySet()),
                    new RelationshipField(TopicAssignment.EntityId, articleMap.keySet())
                }
            );
            insert topicAssignmentGenerator.generate();
            Map<Id, TopicAssignment> topicAssignmentMap = new Map<Id, TopicAssignment>((List<TopicAssignment>) topicAssignmentGenerator.records);

            Test.startTest();
            List<RecommendedArticle__c> actualArticles = new RecommendedArticlesSelector().selectAllWithTopics();
            Test.stopTest();

            Assert.areEqual(articleMap.keySet(), (new Map<Id, RecommendedArticle__c>(actualArticles)).keySet(), 'Expected all recommended articles to be returned.');
            for(RecommendedArticle__c a : actualArticles) {
                for(TopicAssignment ta : a.TopicAssignments) {
                    Assert.areEqual(topicAssignmentMap.get(ta.Id).EntityId, a.Id, 'Expected Topic Assignment to be related to current Recommended Article.');
                }
            }
        }
    }
}