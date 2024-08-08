@isTest
private class RecommendedBadgeTrailTriggerHelper_Tests {
    private static void cleanup(List<AsyncApexJob> jobs, Boolean failEventDelivery) {
        if(failEventDelivery) {
            Test.getEventBus().fail();
        }
        for(AsyncApexJob job : jobs) {
            System.abortJob(job.Id);
        }
    }

    @isTest
    private static void it_should_enqueue_jobs_for_badges() {
        RecommendedBadgeTS badgeGenerator = new RecommendedBadgeTS(new Map<String, Object> {
            'generateMasterRecords' => false,
            'useFieldDefaults' => false,
            'numberToGenerate' => Limits.getLimitQueueableJobs()
        });
        
        Test.startTest();
        RecommendedBadgeTrailTriggerHelper.enabledForTesting = true;
        RecommendedBadgeTrailTriggerHelper.queueTrailTrackerProviderCallouts(Recommended_Badge__c.getSObjectType(), new Map<Id, sObject>(badgeGenerator.generate()));
        List<AsyncApexJob> queuedJobs = [SELECT Id FROM AsyncApexJob WHERE ApexClass.Name = 'QueueableTrailTrackerProviderCallout' AND JobType = 'Queueable' AND Status = 'Queued'];
        Assert.areEqual(badgeGenerator.records.size(), queuedJobs.size(), 'Expected one queued Trail Tracker Provider callout per Recommended Badge.');

        cleanup(queuedJobs, false);
        Test.stopTest();
    }

    @isTest
    private static void it_should_enqueue_jobs_for_trails() {
        RecommendedTrailTS trailGenerator = new RecommendedTrailTS(new Map<String, Object> {
            'generateMasterRecords' => false,
            'useFieldDefaults' => false,
            'numberToGenerate' => Limits.getLimitQueueableJobs()
        });
        
        Test.startTest();
        RecommendedBadgeTrailTriggerHelper.enabledForTesting = true;
        RecommendedBadgeTrailTriggerHelper.queueTrailTrackerProviderCallouts(Recommended_Trail__c.getSObjectType(), new Map<Id, sObject>(trailGenerator.generate()));
        List<AsyncApexJob> queuedJobs = [SELECT Id FROM AsyncApexJob WHERE ApexClass.Name = 'QueueableTrailTrackerProviderCallout' AND JobType = 'Queueable' AND Status = 'Queued'];
        Assert.areEqual(trailGenerator.records.size(), queuedJobs.size(), 'Expected one queued Trail Tracker Provider callout per Recommended Trail.');

        cleanup(queuedJobs, false);
        Test.stopTest();
    }

    @isTest
    private static void it_should_enqueue_jobs_and_publish_record_events_for_badges() {
        RecommendedBadgeTS badgeGenerator = new RecommendedBadgeTS(new Map<String, Object> {
            'generateMasterRecords' => false,
            'useFieldDefaults' => false
        });
        
        Test.startTest();
        RecommendedBadgeTrailTriggerHelper.enabledForTesting = true;
        RecommendedBadgeTrailTriggerHelper.queueTrailTrackerProviderCallouts(Recommended_Badge__c.getSObjectType(), new Map<Id, sObject>(badgeGenerator.generate()));
        List<AsyncApexJob> queuedJobs = [SELECT Id FROM AsyncApexJob WHERE ApexClass.Name = 'QueueableTrailTrackerProviderCallout' AND JobType = 'Queueable' AND Status = 'Queued'];

        Assert.areEqual(
            Limits.getLimitQueueableJobs(), 
            queuedJobs.size(), 
            'Expected the number of queued Trail Tracker Provider callouts to equal the Apex governor on queued jobs.'
        );
        Assert.areEqual(1, Limits.getDmlStatements(), 'Expected one DML statement to publish NewRecommendedBadgeTrailEvent__e platform events.');
        Assert.areEqual(
            badgeGenerator.records.size() - Limits.getLimitQueueableJobs(), 
            Limits.getDmlRows(), 
            'Expected the number of published NewRecommendedBadgeTrailEvent__e events to equal the number of Recommended Badges minus the Apex governor limit on queued jobs.'
        );

        cleanup(queuedJobs, true);
        Test.stopTest();
    }

    @isTest
    private static void it_should_enqueue_jobs_and_publish_record_events_for_trails() {
        RecommendedTrailTS trailGenerator = new RecommendedTrailTS(new Map<String, Object> {
            'generateMasterRecords' => false,
            'useFieldDefaults' => false
        });
        
        Test.startTest();
        RecommendedBadgeTrailTriggerHelper.enabledForTesting = true;
        RecommendedBadgeTrailTriggerHelper.queueTrailTrackerProviderCallouts(Recommended_Trail__c.getSObjectType(), new Map<Id, sObject>(trailGenerator.generate()));
        List<AsyncApexJob> queuedJobs = [SELECT Id FROM AsyncApexJob WHERE ApexClass.Name = 'QueueableTrailTrackerProviderCallout' AND JobType = 'Queueable' AND Status = 'Queued'];

        Assert.areEqual(
            Limits.getLimitQueueableJobs(), 
            queuedJobs.size(), 
            'Expected the number of queued Trail Tracker Provider callouts to equal the Apex governor on queued jobs.'
        );
        Assert.areEqual(1, Limits.getDmlStatements(), 'Expected one DML statement to publish NewRecommendedBadgeTrailEvent__e platform events.');
        Assert.areEqual(
            trailGenerator.records.size() - Limits.getLimitQueueableJobs(), 
            Limits.getDmlRows(), 
            'Expected the number of published NewRecommendedBadgeTrailEvent__e events to equal the number of Recommended Trails minus the Apex governor limit on queued jobs.'
        );

        cleanup(queuedJobs, true);
        Test.stopTest();
    }

    @isTest
    private static void it_should_ignore_new_records_without_urls() {
        RecommendedBadgeTS badgeGenerator = new RecommendedBadgeTS();
        badgeGenerator.generate();
        List<sObject> testBadges = badgeGenerator.clearField(Recommended_Badge__c.URL__c).modifiedRecords;

        RecommendedTrailTS trailGenerator = new RecommendedTrailTS();
        trailGenerator.generate();
        List<sObject> testTrails = trailGenerator.clearField(Recommended_Trail__c.URL__c).modifiedRecords;

        Test.startTest();
        RecommendedBadgeTrailTriggerHelper.updateURLPaths(Recommended_Badge__c.getSObjectType(), testBadges, null);
        RecommendedBadgeTrailTriggerHelper.updateURLPaths(Recommended_Trail__c.getSObjectType(), testTrails, null);

        for(sObject badge : testBadges) {
            Assert.isNull(badge.get('URL__c'), 'Expected null URL to be unchanged by RecommendedBadgeTrailTriggerHelper.updateURLPaths().');
        }

        for(sObject trail : testTrails) {
            Assert.isNull(trail.get('URL__c'), 'Expected null URL to be unchanged by RecommendedBadgeTrailTriggerHelper.updateURLPaths().');
        }
    }

    @isTest
    private static void it_should_update_urls_for_new_records() {
        RecommendedBadgeTS badgeGenerator = new RecommendedBadgeTS(
            new Map<String, Object>{'generatorReturnValue' => 'all', 'numberToGenerate' => 100}, 
            new List<TestSupport.TestDataField>{
                new TestSupport.TestDataField(Recommended_Badge__c.Type__c, 'Module'),
                new CounterSuffixField(Recommended_Badge__c.URL__c, RecommendedBadgeTrailTriggerHelper.TRAILHEAD_URL_MAPPINGS.get('Module').defaultPath + '/Test_Badge_')
            }
        );
        badgeGenerator.generate();
        badgeGenerator.setFieldSpecs(new List<TestSupport.TestDataField>{
            new CounterSuffixField(Recommended_Badge__c.BadgeAPIName__c, 'Test_Project_'),
            new TestSupport.TestDataField(Recommended_Badge__c.Type__c, 'Project'),
            new CounterSuffixField(Recommended_Badge__c.URL__c, RecommendedBadgeTrailTriggerHelper.TRAILHEAD_URL_MAPPINGS.get('Project').defaultPath + '/Test_Project_')
        }).generate();
        List<Recommended_Badge__c> testBadges = (List<Recommended_Badge__c>) badgeGenerator.setFieldSpecs(new List<TestSupport.TestDataField>{
            new CounterSuffixField(Recommended_Badge__c.BadgeAPIName__c, 'Test_Superbadge_'),
            new TestSupport.TestDataField(Recommended_Badge__c.Type__c, 'Superbadge'),
            new CounterSuffixField(Recommended_Badge__c.URL__c, RecommendedBadgeTrailTriggerHelper.TRAILHEAD_URL_MAPPINGS.get('Superbadge').defaultPath + '/Test_Superbadge_')
        }).generate();

        RecommendedTrailTS trailGenerator = new RecommendedTrailTS(new List<TestSupport.TestDataField>{
            new CounterSuffixField(Recommended_Trail__c.URL__c, RecommendedBadgeTrailTriggerHelper.TRAILHEAD_URL_MAPPINGS.get('Trail').defaultPath + '/Test_Trail_')
        });
        List<Recommended_Trail__c> testTrails = (List<Recommended_Trail__c>) new RecommendedTrailTS(new List<TestSupport.TestDataField>{
            new CounterSuffixField(Recommended_Trail__c.URL__c, RecommendedBadgeTrailTriggerHelper.TRAILHEAD_URL_MAPPINGS.get('Trail').defaultPath + '/Test_Trail_')
        }).generate();

        Test.startTest();
        RecommendedBadgeTrailTriggerHelper.updateURLPaths(Recommended_Badge__c.getSObjectType(), testBadges, null);
        RecommendedBadgeTrailTriggerHelper.updateURLPaths(Recommended_Trail__c.getSObjectType(), testTrails, null);
        Test.stopTest();

        for(Recommended_Badge__c badge : testBadges) {
            Assert.areEqual(
                RecommendedBadgeTrailTriggerHelper.TRAILHEAD_URL_MAPPINGS.get(badge.Type__c).trailheadPath + '/' + badge.BadgeAPIName__c,
                badge.URL__c,
                'Expected URL to be updated to Trailhead path from default path.'
            );
        }

        String trailPath = RecommendedBadgeTrailTriggerHelper.TRAILHEAD_URL_MAPPINGS.get('Trail').trailheadPath;
        for(Recommended_Trail__c trail : testTrails) {
            Assert.areEqual(trailPath + '/' + trail.TrailAPIName__c, trail.URL__c, 'Expected URL to be updated to Trailhead path from default path.');
        }
    }

    @isTest
    private static void it_should_ignore_updated_records_without_changed_urls() {
        RecommendedBadgeTS badgeGenerator = new RecommendedBadgeTS();
        Map<Id, sObject> oldTestBadges = new Map<Id, sObject>(badgeGenerator.generate());
        List<Recommended_Badge__c> updatedTestBadges = (List<Recommended_Badge__c>) badgeGenerator.changeField(
            Recommended_Badge__c.Description__c, 'Updated description.'
        ).modifiedRecords;
        Map<Id, Recommended_Badge__c> expectedUpdatedBadges = new Map<Id, Recommended_Badge__c>(updatedTestBadges.deepClone(true));

        RecommendedTrailTS trailGenerator = new RecommendedTrailTS();
        Map<Id, sObject> oldTestTrails = new Map<Id, sObject>(trailGenerator.generate());
        List<Recommended_Trail__c> updatedTestTrails = (List<Recommended_Trail__c>) trailGenerator.changeField(
            Recommended_Trail__c.Description__c, 'Updated description.'
        ).modifiedRecords;
        Map<Id, Recommended_Trail__c> expectedUpdatedTrails = new Map<Id, Recommended_Trail__c>(updatedTestTrails.deepClone(true));

        Test.startTest();
        RecommendedBadgeTrailTriggerHelper.updateURLPaths(Recommended_Badge__c.getSObjectType(), updatedTestBadges, oldTestBadges);
        RecommendedBadgeTrailTriggerHelper.updateURLPaths(Recommended_Trail__c.getSObjectType(), updatedTestTrails, oldTestTrails);
        Test.StopTest();

        for(Recommended_Badge__c badge : updatedTestBadges) {
            Assert.areEqual(
                expectedUpdatedBadges.get(badge.Id).URL__c, 
                badge.URL__c, 
                'Expected unchanged URL to be unchanged by RecommendedBadgeTrailTriggerHelper.updateURLPaths().'
            );
        }

        for(Recommended_Trail__c trail : updatedTestTrails) {
            Assert.areEqual(
                expectedUpdatedTrails.get(trail.Id).URL__c,
                trail.URL__c,
                'Expected unchanged URL to be unchanged by RecommendedBadgeTrailTriggerHelper.updateURLPaths().'
            );
        }
    }

    @isTest
    private static void it_should_update_urls_for_updated_records() {
        Map<Id, sObject> oldTestBadges = new Map<Id, sObject>(new RecommendedBadgeTS().generate());
        List<Recommended_Badge__c> updatedTestBadges = (List<Recommended_Badge__c>) oldTestBadges.values().deepClone(true);
        for(Recommended_Badge__c badge : updatedTestBadges) {
            badge.URL__c = RecommendedBadgeTrailTriggerHelper.TRAILHEAD_URL_MAPPINGS.get(badge.Type__c).defaultPath + '/' + badge.BadgeAPIName__c;
        }

        Map<Id, sObject> oldTestTrails = new Map<Id, sObject>(new RecommendedTrailTS().generate());
        List<Recommended_Trail__c> updatedTestTrails = (List<Recommended_Trail__c>) oldTestTrails.values().deepClone(true);
        String defaultTrailPath = RecommendedBadgeTrailTriggerHelper.TRAILHEAD_URL_MAPPINGS.get('Trail').defaultPath;
        for(Recommended_Trail__c trail : updatedTestTrails) {
            trail.URL__c = defaultTrailPath + '/' + trail.TrailAPIName__c;
        }

        Test.startTest();
        RecommendedBadgeTrailTriggerHelper.updateURLPaths(Recommended_Badge__c.getSObjectType(), updatedTestBadges, oldTestBadges);
        RecommendedBadgeTrailTriggerHelper.updateURLPaths(Recommended_Trail__c.getSObjectType(), updatedTestTrails, oldTestTrails);
        Test.stopTest();

        for(Recommended_Badge__c badge : updatedTestBadges) {
            Assert.areEqual(
                RecommendedBadgeTrailTriggerHelper.TRAILHEAD_URL_MAPPINGS.get(badge.Type__c).trailheadPath + '/' + badge.BadgeAPIName__c,
                badge.URL__c,
                'Expected URL to be updated to Trailhead path from default path.'
            );
        }

        String trailPath = RecommendedBadgeTrailTriggerHelper.TRAILHEAD_URL_MAPPINGS.get('Trail').trailheadPath;
        for(Recommended_Trail__c trail : updatedTestTrails) {
            Assert.areEqual(trailPath + '/' + trail.TrailAPIName__c, trail.URL__c, 'Expected URL to be updated to Trailhead path from default path.');
        }
    }
}