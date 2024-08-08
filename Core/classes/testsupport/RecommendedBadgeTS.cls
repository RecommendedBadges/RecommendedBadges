@isTest
public class RecommendedBadgeTS extends TestSupport.DataGeneration {
    public MixCategoryTS mixCategoryGenerator;

    /**
     * No arg constructor
     */    
    public RecommendedBadgeTS() {
        this(new Map<String, Object>(), new List<TestSupport.TestDataField>());
    }

    /**
     * Constructor with configuration options
     * @param options 
     */    
    public RecommendedBadgeTS(Map<String, Object> options) {
        this(options, new List<TestSupport.TestDataField>());
    }

    /**
     * Constructor with custom field specs
     * @param fieldSpecs 
     */    
    public RecommendedBadgeTS(List<TestSupport.TestDataField> fieldSpecs) {
        this(new Map<String, Object>(), fieldSpecs);
    }

    /**
     * Constructor with configuration options and custom field specs
     * @param options 
     * @param fieldSpecs 
     */    
    public RecommendedBadgeTS(Map<String, Object> options, List<TestSupport.TestDataField> fieldSpecs) {
        super(options, fieldSpecs);
        this.S_OBJECT_TYPE = 'Recommended_Badge__c';
        this.generateMasterRecords = Boolean.valueOf(options.get('generateMasterRecords') ?? true);
    }

    protected override Map<Schema.SObjectField, TestSupport.TestDataField> loadDefaultSpecsByField() {
        return new Map<Schema.SObjectField, TestSupport.TestDataField>{
            Recommended_Badge__c.BadgeAPIName__c => new CounterSuffixField(Recommended_Badge__c.BadgeAPIName__c, 'Test_Badge_'),
            Recommended_Badge__c.BadgeName__c => new CounterSuffixField(Recommended_Badge__c.BadgeName__c, 'Test Badge '),
            Recommended_Badge__c.Description__c => new TestSupport.TestDataField(Recommended_Badge__c.Description__c, 'Test description.'),
            Recommended_Badge__c.Icon__c => new TestSupport.TestDataField(Recommended_Badge__c.Icon__c, 'www.testicon.com'),
            Recommended_Badge__c.Level__c => new RandomPicklistValueField(Recommended_Badge__c.Level__c),
            Recommended_Badge__c.Products__c => new TestSupport.TestDataField(Recommended_Badge__c.Products__c, 'Test products'),
            Recommended_Badge__c.Type__c => new RandomPicklistValueField(Recommended_Badge__c.Type__c),
            Recommended_Badge__c.URL__c => new TestSupport.TestDataField(Recommended_Badge__c.URL__c, 'www.test.com')
        };
    }

    protected override Map<Schema.SObjectField, RelationshipField> loadMasterDetailFields() {
        this.mixCategoryGenerator = new MixCategoryTS(new Map<String, Object>{'numberToGenerate' => 100});
        return new Map<Schema.SObjectField, RelationshipField> {
            Recommended_Badge__c.Mix_Category__c => new RelationshipField(
                Recommended_Badge__c.Mix_Category__c, new Map<Id, sObject>(this.mixCategoryGenerator.generate()).keySet()
            )
        };
    }
}