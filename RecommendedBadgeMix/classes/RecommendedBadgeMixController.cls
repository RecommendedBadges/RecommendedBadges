/**
 * Apex controller for recommendedBadgeMixContainer LWC.
 * @author Ben Learn
 * @since 02-07-2023
 * @group RecommendedBadgeMix
 */
public with sharing class RecommendedBadgeMixController {
    /**
     * Method to retrieve necessary data - including mix categories, recommended badges, and recommended trails for public recommended
     *  badge mixes, as well as the name of the default mix - for recommendedBadgeMixContainer.
     * @return  `DataWrapper`
     */
    @AuraEnabled(cacheable=true scope='global')
    public static DataWrapper getData() {
        List<Mix_Category__c> mixCategories = new MixCategoriesSelector().selectRecommendedBadgesAndTrails();

        Map<String, Recommended_Badge_Mix__c> badgeMixesByName = new Map<String, Recommended_Badge_Mix__c>();
        Map<String, List<MixCategoryWrapper>> categoriesByBadgeMix = new Map<String, List<MixCategoryWrapper>>();
        List<MixCategoryChild> mixCategoryChildren;
        List<MixCategoryWrapper> existingMixCategories;
        DataWeave.Script dwscript = new DataWeaveScriptResource.recommendedBadgeMixContainerMapping();
        DataWeave.Result dwresult;

        for(Mix_Category__c mixCategory : mixCategories) {
            mixCategoryChildren = new List<MixCategoryChild>();
            if(mixCategory.Recommended_Badges__r.size() > 0) {
                dwresult = dwscript.execute(new Map<String, Object>{'payload' => mixCategory.Recommended_Badges__r});
                mixCategoryChildren.addAll((List<MixCategoryChild>) dwresult.getValue());
            }
            if(mixCategory.Recommended_Trails__r.size() > 0) {
                dwresult = dwscript.execute(new Map<String, Object>{'payload' => mixCategory.Recommended_Trails__r});
                mixCategoryChildren.addAll((List<MixCategoryChild>) dwresult.getValue());
            }

            if(categoriesByBadgeMix.get(mixCategory.Recommended_Badge_Mix__r.Name) == null) {
                categoriesByBadgeMix.put(mixCategory.Recommended_Badge_Mix__r.Name, new List<MixCategoryWrapper>{new MixCategoryWrapper(mixCategory, mixCategoryChildren)});
            } else {
                existingMixCategories = categoriesByBadgeMix.get(mixCategory.Recommended_Badge_Mix__r.Name);
                existingMixCategories.add(new MixCategoryWrapper(mixCategory, mixCategoryChildren));
                categoriesByBadgeMix.put(mixCategory.Recommended_Badge_Mix__r.Name, existingMixCategories);
            }

            if(badgeMixesByName.get(mixCategory.Recommended_Badge_Mix__r.Name) == null) {
                badgeMixesByName.put(mixCategory.Recommended_Badge_Mix__r.Name, mixCategory.Recommended_Badge_Mix__r);
            }
        }

        List<Recommended_Badge_Mix__c> defaultMix = new RecommendedBadgeMixesSelector().selectDefaultMix();
        String defaultMixName;
        if(defaultMix.size() > 0) {
            defaultMixName = defaultMix[0].Name;
        } else {
            defaultMixName = mixCategories[0].Recommended_Badge_Mix__r.Name;
        }

        DataWrapper data = new DataWrapper(categoriesByBadgeMix, defaultMixName, badgeMixesByName);
        return data;
    }

    @TestVisible
    private class DataWrapper {
        /**
         * Mix Categories (including children Recommended Badges/Trails) by parent Recommended Badge Mix
         */
        @AuraEnabled
        public Map<String, List<MixCategoryWrapper>> categoriesByBadgeMix {get;set;}

        /**
         * Name of default Recommended Badge Mix
         */
        @AuraEnabled
        public String defaultMix {get;set;}

        /**
         * Last updated dates by Recommended Badge Mix
         */
        @AuraEnabled
        public Map<String, Recommended_Badge_Mix__c> badgeMixesByName {get;set;}

        private DataWrapper(Map<String, List<MixCategoryWrapper>> categoriesByBadgeMix, String defaultMix, Map<String, Recommended_Badge_Mix__c> badgeMixesByName) {
            this.categoriesByBadgeMix = categoriesByBadgeMix;
            this.defaultMix = defaultMix;
            this.badgeMixesByName = badgeMixesByName;
        }
    }

    private class MixCategoryWrapper {
        @AuraEnabled
        public Mix_Category__c mixCategory;
        @AuraEnabled
        public List<MixCategoryChild> children;

        private MixCategoryWrapper(Mix_Category__c mixCategory, List<MixCategoryChild> children) {
            this.mixCategory = mixCategory;
            this.children = children;
        }
    }

    /**
     * Wrapper class for Recommended Badges/Recommended Trails for recommendedBadgeMixContainer LWC.
     */
    public class MixCategoryChild {
        @AuraEnabled
        public String Id;
        @AuraEnabled
        public String Name;
        @AuraEnabled
        public String Level;
        @AuraEnabled
        public String Type;
        @AuraEnabled
        public String URL;
    }
}