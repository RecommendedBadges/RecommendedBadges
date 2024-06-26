/**
 * @description       : Test class for PrivateViewController class.
 * @author            : Ben Learn
 * @last modified on  : 02-20-2023
 * @last modified by  : Ben Learn
**/
@isTest(IsParallel=true)
private class PrivateViewControllerTests {
    @isTest
    private static void getMixCategoryData_test() {
        TestDataFactory.RecommendedBadgeMix recommendedBadgeMixGenerator = new TestDataFactory.RecommendedBadgeMix(true, true);
        List<Recommended_Badge_Mix__c> testRecommendedBadgeMixes = recommendedBadgeMixGenerator.execute();

        TestDataFactory.MixCategory mixCategoryGenerator = new TestDataFactory.MixCategory(true, false, testRecommendedBadgeMixes);
        List<Mix_Category__c> testMixCategories = mixCategoryGenerator.execute();

        testMixCategories = [
            SELECT Name, Recommended_Badge_Mix__r.Name, Recommended_Badge_Mix__r.Private_Mix__c
            FROM Mix_Category__c
            ORDER BY Name
        ];

        Test.startTest();
        List<Mix_Category__c> mixCategoryData = PrivateViewController.getMixCategoryData();
        Test.stopTest();

        System.assert(testMixCategories.equals(mixCategoryData), 'Expected Mix Category data to equal test data.');
    }

    @isTest
    private static void getPrivateMixRecommendedBadges_test() {
        TestDataFactory.RecommendedBadgeMix recommendedBadgeMixGenerator = new TestDataFactory.RecommendedBadgeMix(true, true, 2, false, true);
        List<Recommended_Badge_Mix__c> testRecommendedBadgeMixes = recommendedBadgeMixGenerator.execute();

        TestDataFactory.MixCategory mixCategoryGenerator = new TestDataFactory.MixCategory(true, true, 20, testRecommendedBadgeMixes);
        List<Mix_Category__c> testMixCategories = mixCategoryGenerator.execute();
        
        TestDataFactory.RecommendedBadge recommendedBadgeGenerator = new TestDataFactory.RecommendedBadge(true, false, testMixCategories, true);
        recommendedBadgeGenerator.execute();

        List<Recommended_Badge__c> resultRecommendedBadges = [
            SELECT BadgeName__c, High_Priority__c, High_Priority_Id__c, Level__c, Time_Estimate_Minutes__c, Time_Estimate__c, Type__c, URL__c, Mix_Category__r.Name 
            FROM Recommended_Badge__c 
            WHERE Mix_Category__r.Recommended_Badge_Mix__r.Private_Mix__c = true ORDER BY BadgeName__c
        ];

        Map<String, List<Recommended_Badge__c>> resultRecommendedBadgeMap = new Map<String, List<Recommended_Badge__c>>();
        resultRecommendedBadgeMap.put('High Priority', new List<Recommended_Badge__c>());
        for(Recommended_Badge__c rb : resultRecommendedBadges) {
            if(rb.High_Priority__c) {
                List<Recommended_Badge__c> currentRecommendedBadges = resultRecommendedBadgeMap.get('High Priority');
                currentRecommendedBadges.add(rb);
                resultRecommendedBadgeMap.put('High Priority', currentRecommendedBadges);
            }

            if(resultRecommendedBadgeMap.get(rb.Mix_Category__r.Name) != null) {
                List<Recommended_Badge__c> currentRecommendedBadges = resultRecommendedBadgeMap.get(rb.Mix_Category__r.Name);
                currentRecommendedBadges.add(rb);
                resultRecommendedBadgeMap.put(rb.Mix_Category__r.Name, currentRecommendedBadges);
            } else {
                resultRecommendedBadgeMap.put(rb.Mix_Category__r.Name, new List<Recommended_Badge__c>{rb});
            }
        }

        Test.startTest();
        Map<String, List<Recommended_Badge__c>> privateViewMap = PrivateViewController.getPrivateMixRecommendedBadges();
        Test.stopTest();

        Assert.isTrue(resultRecommendedBadgeMap.keySet().equals(privateViewMap.keySet()), 'Expected private view Recommended Badges to equal test data.');
        for(String mixCategory : privateViewMap.keySet()) {
            List<Recommended_Badge__c> expectedMixCategoryBadges = resultRecommendedBadgeMap.get(mixCategory);
            for(Recommended_Badge__c badge : privateViewMap.get(mixCategory)) {
                expectedMixCategoryBadges.remove(expectedMixCategoryBadges.indexOf(badge));
            }
            Assert.areEqual(0, expectedMixCategoryBadges.size(), 'Expected private view Recommended Badges to equal test data.');
        }
    }
}
