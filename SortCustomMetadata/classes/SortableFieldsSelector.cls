/**
 * Selector class for Sortable Field custom metadata type.
 * @author Ben Learn
 * @since 01-29-2023
 * @group SortCustomMetadata
 */
public inherited sharing class SortableFieldsSelector extends ApplicationSelector {
    /**
     * fflib method to hold the fields to always be queried by the selector
     * @return  `List<Schema.SObjectField>`
     */
    public List<Schema.SObjectField> getSObjectFieldList() {
        return new List<Schema.SObjectField> {
            Sortable_Field__mdt.MasterLabel,
            Sortable_Field__mdt.Field_API_Name__c
        };
    }

    /**
     * fflib method to return the sObjectType of the object being queried
     * @return  `Schema.SObjectType`
     */
    public Schema.SObjectType getSObjectType() {
        return Sortable_Field__mdt.sObjectType;
    }

    /**
     * Retrieves all Sortable_Field__mdt records (along with children Sortable_Field_Value__mdt records) with a Sortable_LWC__mdt whose label matches the provided value
     * @param componentName 
     * @return  `List<Schema.Sortable_Field__mdt>`
     */
    public List<Schema.Sortable_Field__mdt> selectByComponentNameWithSortableFieldValues(String componentName) {
        fflib_QueryFactory sortableFieldsQueryFactory = newQueryFactory();

        String relationshipName;
        List<Schema.ChildRelationship> sortableFieldsChildRelationships = Schema.SObjectType.Sortable_Field__mdt.getChildRelationships();
        for(Schema.ChildRelationship childRelationship : sortableFieldsChildRelationships) {
            if(childRelationship.getChildSObject() == Sortable_Field_Value__mdt.sObjectType) {
                relationshipName = childRelationship.getRelationshipName();
                break;
            }
        }

        fflib_QueryFactory sortableFieldValuesSubQueryFactory = new SortableFieldValuesSelector().addQueryFactorySubselect(sortableFieldsQueryFactory, relationshipName, true).
            setOrdering(new fflib_QueryFactory.Ordering(
                Schema.SObjectType.Sortable_Field_Value__mdt.getName(),
                Schema.SObjectType.Sortable_Field_Value__mdt.fields.Sort_Order__c.getName(),
                fflib_QueryFactory.SortOrder.ASCENDING
            ));
        return (List<Sortable_Field__mdt>) Database.query(sortableFieldsQueryFactory.setCondition('Sortable_LWC__r.MasterLabel = :componentName').toSOQL());
    }
}