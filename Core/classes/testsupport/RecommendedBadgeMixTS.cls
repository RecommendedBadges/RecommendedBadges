@isTest
public class RecommendedBadgeMixTS extends TestSupport.DataGeneration {
    /**
     * No arg constructor
     */    
    public RecommendedBadgeMixTS() {
        this(new Map<String, Object>(), new List<TestSupport.TestDataField>());
    }

    /**
     * Constructor with configuration options
     * @param options 
     */    
    public RecommendedBadgeMixTS(Map<String, Object> options) {
        this(options, new List<TestSupport.TestDataField>());
    }

    /**
     * Constructor with custom field specs
     * @param fieldSpecs 
     */    
    public RecommendedBadgeMixTS(List<TestSupport.TestDataField> fieldSpecs) {
        this(new Map<String, Object>(), fieldSpecs);
    }

    /**
     * Constructor with configuration options and custom field specs
     * @param options 
     * @param fieldSpecs 
     */    
    public RecommendedBadgeMixTS(Map<String, Object> options, List<TestSupport.TestDataField> fieldSpecs) {
        super(options, fieldSpecs);
        this.S_OBJECT_TYPE = 'Recommended_Badge_Mix__c';
    }

    protected override Map<Schema.SObjectField, TestSupport.TestDataField> loadDefaultSpecsByField() {
        return new Map<Schema.SObjectField, TestSupport.TestDataField>{
            Recommended_Badge_Mix__c.Name => new CounterSuffixField(Recommended_Badge_Mix__c.Name, 'Test Mix '),
            Recommended_Badge_Mix__c.Private_Mix__c => new BooleanField(Recommended_Badge_Mix__c.Private_Mix__c)
        };
    }
}