@isTest
public class RecommendedArticleTS extends TestSupport.DataGeneration {
    /**
     * No arg constructor
     */    
    public RecommendedArticleTS() {
        this(new Map<String, Object>(), new List<TestSupport.TestDataField>());
    }

    /**
     * Constructor with configuration options
     * @param options 
     */    
    public RecommendedArticleTS(Map<String, Object> options) {
        this(options, new List<TestSupport.TestDataField>());
    }

    /**
     * Constructor with custom field specs
     * @param fieldSpecs 
     */    
    public RecommendedArticleTS(List<TestSupport.TestDataField> fieldSpecs) {
        this(new Map<String, Object>(), fieldSpecs);
    }

    /**
     * Constructor with configuration options and custom field specs
     * @param options 
     * @param fieldSpecs 
     */    
    public RecommendedArticleTS(Map<String, Object> options, List<TestSupport.TestDataField> fieldSpecs) {
        super(options, fieldSpecs);
        this.S_OBJECT_TYPE = 'RecommendedArticle__c';
    }

    protected override Map<Schema.SObjectField, TestSupport.TestDataField> loadDefaultSpecsByField() {
        return new Map<Schema.SObjectField, TestSupport.TestDataField>{
            RecommendedArticle__c.Title__c => new CounterSuffixField(RecommendedArticle__c.Title__c, 'Test Title '),
            Recommendedarticle__c.URL__c => new TestSupport.TestDataField(RecommendedArticle__c.URL__c, 'www.test.com')
        };
    }
}