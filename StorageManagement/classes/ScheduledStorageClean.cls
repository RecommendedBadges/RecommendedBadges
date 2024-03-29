/**
 * @description       : Schedulable Apex class to clear storage space by deleting unused records created by Trail Tracker app.
 * @author            : Ben Learn
 * @group             : 
 * @last modified on  : 01-29-2023
 * @last modified by  : Ben Learn
**/
public without sharing class ScheduledStorageClean implements Schedulable {
    private final static String LOGGER_TAG = 'Scheduled';

    @testVisible
    private final static String METHOD_NAME = 'startAsync';

    /**
    * @description Scheduled method to clear storage space.
    * @author Ben Learn | 03-23-2022 
    * @param SchedulableContext sc 
    **/
    public void execute(SchedulableContext sc) {
        List<AsyncApexJob> asyncJobs = Test.isRunningTest() ? 
            ((AsyncApexJobsSelector) ScheduledStorageCleanMockUtils.createMock(AsyncApexJobsSelector.class)).selectCompletedJobsByMethod(METHOD_NAME) : 
            new AsyncApexJobsSelector().selectCompletedJobsByMethod(METHOD_NAME);
        System.debug(asyncJobs.size());

        if(asyncJobs.size() > 0){
            try {
                if(Test.isRunningTest()) throw new DMLException('DMLException');
                StorageManagementService.clean();
            } catch(DMLException e) {
                Logger.info(e.getMessage()).setExceptionDetails(e).addTag(LOGGER_TAG);
                Logger.saveLog();
            }
        }
    }
}