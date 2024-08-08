@isTest
public class NewRecommendedBadgeTrailEventTS extends TestSupport.DataGeneration {    
    /**
     * No arg constructor
     */    
    public NewRecommendedBadgeTrailEventTS() {
        this(new Map<String, Object>(), new List<TestSupport.TestDataField>());
    }

    /**
     * Constructor with configuration options
     * @param options 
     */    
    public NewRecommendedBadgeTrailEventTS(Map<String, Object> options) {
        this(options, new List<TestSupport.TestDataField>());
    }

    /**
     * Constructor with custom field specs
     * @param fieldSpecs 
     */    
    public NewRecommendedBadgeTrailEventTS(List<TestSupport.TestDataField> fieldSpecs) {
        this(new Map<String, Object>(), fieldSpecs);
    }

    /**
     * Constructor with configuration options and custom field specs
     * @param options 
     * @param fieldSpecs 
     */    
    public NewRecommendedBadgeTrailEventTS(Map<String, Object> options, List<TestSupport.TestDataField> fieldSpecs) {
        super(options, fieldSpecs);
        this.S_OBJECT_TYPE = 'NewRecommendedBadgeTrailEvent__e';
        this.useFieldDefaults = false;
    }
}