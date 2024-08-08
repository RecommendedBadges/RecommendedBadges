@isTest
public class TopicTS extends TestSupport.DataGeneration {
    /**
     * No arg constructor
     */    
    public TopicTS() {
        this(new Map<String, Object>(), new List<TestSupport.TestDataField>());
    }

    /**
     * Constructor with configuration options
     * @param options 
     */    
    public TopicTS(Map<String, Object> options) {
        this(options, new List<TestSupport.TestDataField>());
    }

    /**
     * Constructor with custom field specs
     * @param fieldSpecs 
     */    
    public TopicTS(List<TestSupport.TestDataField> fieldSpecs) {
        this(new Map<String, Object>(), fieldSpecs);
    }

    /**
     * Constructor with configuration options and custom field specs
     * @param options 
     * @param fieldSpecs 
     */    
    public TopicTS(Map<String, Object> options, List<TestSupport.TestDataField> fieldSpecs) {
        super(options, fieldSpecs);
        this.S_OBJECT_TYPE = 'Topic';
    }

    protected override Map<Schema.SObjectField, TestSupport.TestDataField> loadDefaultSpecsByField() {
        return new Map<Schema.SObjectField, TestSupport.TestDataField>{
            Topic.Name => new CounterSuffixField(Topic.Name, 'Topic ')
        };
    }
}