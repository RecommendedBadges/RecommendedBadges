@isTest
public class RecommendedTrailTS extends TestSupport.DataGeneration {
    public MixCategoryTS mixCategoryGenerator;
    
    /**
     * No arg constructor
     */    
    public RecommendedTrailTS() {
        this(new Map<String, Object>(), new List<TestSupport.TestDataField>());
    }

    /**
     * Constructor with configuration options
     * @param options 
     */    
    public RecommendedTrailTS(Map<String, Object> options) {
        this(options, new List<TestSupport.TestDataField>());
    }

    /**
     * Constructor with custom field specs
     * @param fieldSpecs 
     */    
    public RecommendedTrailTS(List<TestSupport.TestDataField> fieldSpecs) {
        this(new Map<String, Object>(), fieldSpecs);
    }

    /**
     * Constructor with configuration options and custom field specs
     * @param options 
     * @param fieldSpecs 
     */    
    public RecommendedTrailTS(Map<String, Object> options, List<TestSupport.TestDataField> fieldSpecs) {
        super(options, fieldSpecs);
        this.S_OBJECT_TYPE = 'Recommended_Trail__c';
        this.generateMasterRecords = Boolean.valueOf(options.get('generateMasterRecords') ?? true);
    }

    protected override Map<Schema.SObjectField, TestSupport.TestDataField> loadDefaultSpecsByField() {
        return new Map<Schema.SObjectField, TestSupport.TestDataField>{
            Recommended_Trail__c.TrailAPIName__c => new CounterSuffixField(Recommended_Trail__c.TrailAPIName__c, 'Test_Trail_'),
            Recommended_Trail__c.TrailName__c => new CounterSuffixField(Recommended_Trail__c.TrailName__c, 'Test Trail '),
            Recommended_Trail__c.Description__c => new TestSupport.TestDataField(Recommended_Trail__c.Description__c, 'Test description.'),
            Recommended_Trail__c.Icon__c => new TestSupport.TestDataField(Recommended_Trail__c.Icon__c, 'www.testicon.com'),
            Recommended_Trail__c.Level__c => new RandomPicklistValueField(Recommended_Trail__c.Level__c),
            Recommended_Trail__c.Products__c => new TestSupport.TestDataField(Recommended_Trail__c.Products__c, 'Test products'),
            Recommended_Trail__c.URL__c => new TestSupport.TestDataField(Recommended_Trail__c.URL__c, 'www.test.com')
        };
    }

    protected override Map<Schema.SObjectField, RelationshipField> loadMasterDetailFields() {
        this.mixCategoryGenerator = new MixCategoryTS(new Map<String, Object>{'numberToGenerate' => 100});
        return new Map<Schema.SObjectField, RelationshipField> {
            Recommended_Trail__c.Mix_Category__c => new RelationshipField(
                Recommended_Trail__c.Mix_Category__c, 
                new Map<Id, sObject>(this.mixCategoryGenerator.generate()).keySet()
            )
        };
    }
}