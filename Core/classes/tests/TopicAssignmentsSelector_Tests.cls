@isTest(IsParallel=true)
private class TopicAssignmentsSelector_Tests {
    @isTest
    private static void getSObjectFieldList_test() {
        List<Schema.SObjectField> expectedFieldList = new List<Schema.SObjectField> {
            TopicAssignment.Id
        };

        Assert.areEqual(expectedFieldList, new TopicAssignmentsSelector().getSObjectFieldList(), SelectorTestErrorMessages.SOBJECT_FIELD_LIST_ERROR_MESSAGE);
    }

    @isTest
    private static void getSObjectType_test() {
        Assert.areEqual(TopicAssignment.sObjectType, new TopicAssignmentsSelector().getSObjectType(), SelectorTestErrorMessages.SOBJECT_TYPE_ERROR_MESSAGE);
    }
}