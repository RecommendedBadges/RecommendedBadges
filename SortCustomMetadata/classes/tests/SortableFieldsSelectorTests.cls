@isTest(IsParallel=true)
private class SortableFieldsSelectorTests {
    @isTest
    private static void getSObjectFieldList_test() {
        List<Schema.SObjectField> expectedFieldList = new List<Schema.SObjectField> {
            Sortable_Field__mdt.MasterLabel,
            Sortable_Field__mdt.Field_API_Name__c
        };

        Assert.areEqual(expectedFieldList, new SortableFieldsSelector().getSObjectFieldList(), TestErrorMessages.SOBJECT_FIELD_LIST_ERROR_MESSAGE);
    }

    @isTest
    private static void getSObjectType_test() {
        Assert.areEqual(Sortable_Field__mdt.sObjectType, new SortableFieldsSelector().getSObjectType(), TestErrorMessages.SOBJECT_TYPE_ERROR_MESSAGE);
    }
}