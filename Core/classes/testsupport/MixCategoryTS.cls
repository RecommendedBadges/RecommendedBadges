@isTest
public class MixCategoryTS extends TestSupport.DataGeneration {
    public RecommendedBadgeMixTS badgeMixGenerator;

    /**
     * No arg constructor
     */       
    public MixCategoryTS() {
        this(new Map<String, Object>(), new List<TestSupport.TestDataField>());
    }

    /**
     * Constructor with configuration options
     * @param options 
     */
    public MixCategoryTS(Map<String, Object> options) {
        this(options, new List<TestSupport.TestDataField>());
    }

    /**
     * Constructor with custom field specs
     * @param fieldSpecs 
     */    
    public MixCategoryTS(List<TestSupport.TestDataField> fieldSpecs) {
        this(new Map<String, Object>(), fieldSpecs);
    }

    /**
     * Constructor with configuration options and custom field specs
     * @param options 
     * @param fieldSpecs 
     */    
    public MixCategoryTS(Map<String, Object> options, List<TestSupport.TestDataField> fieldSpecs) {
        super(options, fieldSpecs);
        this.S_OBJECT_TYPE = 'Mix_Category__c';

        this.generateMasterRecords = Boolean.valueOf(options.get('generateMasterRecords') ?? true);
    }

    protected override Map<Schema.SObjectField, TestSupport.TestDataField> loadDefaultSpecsByField() {
        Map<Schema.SObjectField, TestSupport.TestDataField> defaultSpecsByField = new Map<Schema.SObjectField, TestSupport.TestDataField>{
            Mix_Category__c.Name => new CounterSuffixField(Mix_Category__c.Name, 'Test Category ')
        };
        return defaultSpecsByField;
    }

    protected override Map<Schema.SObjectField, RelationshipField> loadMasterDetailFields() {
        this.badgeMixGenerator = new RecommendedBadgeMixTS(new Map<String, Object>{'numberToGenerate' => 5});
        return new Map<Schema.SObjectField, RelationshipField>{
            Mix_Category__c.Recommended_Badge_Mix__c => new RelationshipField(
                Mix_Category__c.Recommended_Badge_Mix__c, 
                new Map<Id, sObject>(this.badgeMixGenerator.generate()).keySet()
            )
        };
    }
}