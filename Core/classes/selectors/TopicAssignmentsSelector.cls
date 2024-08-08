/**
 * Selector class for TopicAssignment object
 * @author Ben Learn
 * @since 08-06-2024
 * @group Core
 */
public inherited sharing class TopicAssignmentsSelector extends ApplicationSelector {
    /**
     * fflib method to hold the fields to always be queried by the selector
     * @return  `List<Schema.SObjectField>`
     */
    public List<Schema.SObjectField> getSObjectFieldList() {
        return new List<Schema.SObjectField>{
            TopicAssignment.Id
        };
    }

    /**
     * fflib method to return the sObjectType of the object being queried
     * @return  `Schema.SObjectType`
     */     
    public Schema.SObjectType getSObjectType() {
        return TopicAssignment.sObjectType;
    }
}