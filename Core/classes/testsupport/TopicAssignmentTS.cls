@isTest
public class TopicAssignmentTS extends TestSupport.DataGeneration {
    /**
     * No arg constructor
     */    
    public TopicAssignmentTS() {
        this(new Map<String, Object>(), new List<TestSupport.TestDataField>());
    }

    /**
     * Constructor with configuration options
     * @param options 
     */    
    public TopicAssignmentTS(Map<String, Object> options) {
        this(options, new List<TestSupport.TestDataField>());
    }

    /**
     * Constructor with custom field specs
     * @param fieldSpecs 
     */    
    public TopicAssignmentTS(List<TestSupport.TestDataField> fieldSpecs) {
        this(new Map<String, Object>(), fieldSpecs);
    }

    /**
     * Constructor with configuration options and custom field specs
     * @param options 
     * @param fieldSpecs 
     */    
    public TopicAssignmentTS(Map<String, Object> options, List<TestSupport.TestDataField> fieldSpecs) {
        super(options, fieldSpecs);
        this.S_OBJECT_TYPE = 'TopicAssignment';
        this.useFieldDefaults = false;
    }
}