@IsTest
private class PrettyTagMultiPicklistFieldProviderTest {
    @IsTest
    static void returnsHintWhenEntityIsBlank() {
        PrettyTagMultiPicklistFieldProvider.testEntityNameOverride = null;
        PrettyTagMultiPicklistFieldProvider provider = new PrettyTagMultiPicklistFieldProvider();

        VisualEditor.DynamicPickListRows rows = provider.getValues();

        System.assertEquals(1, rows.size());
        System.assertEquals('このプロパティはレコードページで選択できます', rows.get(0).getLabel());
        System.assertEquals('', (String)rows.get(0).getValue());
    }

    @IsTest
    static void returnsErrorWhenEntityIsUnknown() {
        PrettyTagMultiPicklistFieldProvider.testEntityNameOverride = 'NoSuchObject__c';
        PrettyTagMultiPicklistFieldProvider provider = new PrettyTagMultiPicklistFieldProvider();

        VisualEditor.DynamicPickListRows rows = provider.getValues();

        System.assertEquals(1, rows.size());
        System.assertEquals('オブジェクト情報を取得できませんでした', rows.get(0).getLabel());
        System.assertEquals('', (String)rows.get(0).getValue());

        PrettyTagMultiPicklistFieldProvider.testEntityNameOverride = null;
    }

    @IsTest
    static void returnsAccountMultiPicklistRows() {
        PrettyTagMultiPicklistFieldProvider.testEntityNameOverride = 'Account';
        PrettyTagMultiPicklistFieldProvider provider = new PrettyTagMultiPicklistFieldProvider();

        VisualEditor.DynamicPickListRows rows = provider.getValues();

        Boolean foundTags = false;
        for (Integer i = 0; i < rows.size(); i++) {
            VisualEditor.DataRow row = rows.get(i);
            if ((String)row.getValue() == 'Tags__c') {
                foundTags = true;
                System.assertEquals('Tags', row.getLabel());
            }
        }

        System.assert(foundTags, 'Account の Multiple Picklist として Tags__c が候補に含まれる必要があります');
        System.assertEquals(true, provider.isValid('anything'));
        System.assertNotEquals(null, provider.getDefaultValue());

        PrettyTagMultiPicklistFieldProvider.testEntityNameOverride = null;
    }

    @IsTest
    static void returnsHintWhenObjectHasNoMultiPicklist() {
        PrettyTagMultiPicklistFieldProvider.testEntityNameOverride = 'Task';
        PrettyTagMultiPicklistFieldProvider provider = new PrettyTagMultiPicklistFieldProvider();

        VisualEditor.DynamicPickListRows rows = provider.getValues();

        System.assertEquals(1, rows.size());
        System.assertEquals('このオブジェクトに Multiple Picklist 項目はありません', rows.get(0).getLabel());
        System.assertEquals('', (String)rows.get(0).getValue());

        PrettyTagMultiPicklistFieldProvider.testEntityNameOverride = null;
    }

    @IsTest
    static void contextConstructorUsesContextEntityWhenNoOverride() {
        PrettyTagMultiPicklistFieldProvider.testEntityNameOverride = null;
        VisualEditor.DesignTimePageContext contextObj =
            (VisualEditor.DesignTimePageContext)JSON.deserialize('{"entityName":"Account"}', VisualEditor.DesignTimePageContext.class);
        PrettyTagMultiPicklistFieldProvider provider = new PrettyTagMultiPicklistFieldProvider(contextObj);

        VisualEditor.DynamicPickListRows rows = provider.getValues();

        System.assert(rows.size() > 0);
        Boolean foundTags = false;
        for (Integer i = 0; i < rows.size(); i++) {
            if ((String)rows.get(i).getValue() == 'Tags__c') {
                foundTags = true;
                break;
            }
        }
        System.assert(foundTags, 'context から Account が解決されること');
    }

    @IsTest
    static void contextConstructorPrefersOverrideWhenPresent() {
        PrettyTagMultiPicklistFieldProvider.testEntityNameOverride = 'NoSuchObject__c';
        VisualEditor.DesignTimePageContext contextObj =
            (VisualEditor.DesignTimePageContext)JSON.deserialize('{"entityName":"Account"}', VisualEditor.DesignTimePageContext.class);
        PrettyTagMultiPicklistFieldProvider provider = new PrettyTagMultiPicklistFieldProvider(contextObj);

        VisualEditor.DynamicPickListRows rows = provider.getValues();

        System.assertEquals(1, rows.size());
        System.assertEquals('オブジェクト情報を取得できませんでした', rows.get(0).getLabel());

        PrettyTagMultiPicklistFieldProvider.testEntityNameOverride = null;
    }

    @IsTest
    static void compareFieldChoiceBranchesAreCovered() {
        PrettyTagMultiPicklistFieldProvider provider = new PrettyTagMultiPicklistFieldProvider();

        Integer equalResult = provider.compareFieldChoiceForTest('Tags__c', 'Tags', 'Tags__c', 'Tags');
        Integer lessResult = provider.compareFieldChoiceForTest('A__c', null, 'B__c', 'B');
        Integer greaterResult = provider.compareFieldChoiceForTest('Z__c', 'ZZZ', 'A__c', 'AAA');

        System.assertEquals(0, equalResult);
        System.assertEquals(-1, lessResult);
        System.assertEquals(1, greaterResult);
    }
}