global with sharing class PrettyTagMultiPicklistFieldProvider extends VisualEditor.DynamicPickList {
    private final String entityName;
    @TestVisible private static String testEntityNameOverride;

    global PrettyTagMultiPicklistFieldProvider() {
        this.entityName = testEntityNameOverride;
    }

    global PrettyTagMultiPicklistFieldProvider(VisualEditor.DesignTimePageContext context) {
        this.entityName = testEntityNameOverride != null
            ? testEntityNameOverride
            : (context != null ? context.entityName : null);
    }

    global override VisualEditor.DataRow getDefaultValue() {
        return new VisualEditor.DataRow('', '');
    }

    global override VisualEditor.DynamicPickListRows getValues() {
        VisualEditor.DynamicPickListRows rows = new VisualEditor.DynamicPickListRows();

        if (String.isBlank(entityName)) {
            rows.addRow(new VisualEditor.DataRow('このプロパティはレコードページで選択できます', ''));
            return rows;
        }

        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(entityName);
        if (targetType == null) {
            rows.addRow(new VisualEditor.DataRow('オブジェクト情報を取得できませんでした', ''));
            return rows;
        }

        List<FieldChoice> choices = new List<FieldChoice>();
        Map<String, Schema.SObjectField> fieldMap = targetType.getDescribe().fields.getMap();

        for (String fieldApiName : fieldMap.keySet()) {
            Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldApiName).getDescribe();
            if (fieldDescribe.getType() == Schema.DisplayType.MultiPicklist) {
                choices.add(new FieldChoice(fieldApiName, fieldDescribe.getLabel()));
            }
        }

        choices.sort();

        if (choices.isEmpty()) {
            rows.addRow(new VisualEditor.DataRow('このオブジェクトに Multiple Picklist 項目はありません', ''));
            return rows;
        }

        for (FieldChoice choice : choices) {
            rows.addRow(new VisualEditor.DataRow(choice.label, choice.apiName));
        }

        return rows;
    }

    global override Boolean isValid(Object attributeValue) {
        return true;
    }

    @TestVisible
    Integer compareFieldChoiceForTest(String leftApiName, String leftLabel, String rightApiName, String rightLabel) {
        FieldChoice left = new FieldChoice(leftApiName, leftLabel);
        FieldChoice right = new FieldChoice(rightApiName, rightLabel);
        return left.compareTo(right);
    }

    private class FieldChoice implements Comparable {
        private final String apiName;
        private final String label;

        private FieldChoice(String apiName, String label) {
            this.apiName = apiName;
            this.label = label;
        }

        public Integer compareTo(Object other) {
            FieldChoice otherChoice = (FieldChoice)other;
            String thisKey = (label == null ? '' : label.toLowerCase()) + ':' + apiName;
            String otherKey = (otherChoice.label == null ? '' : otherChoice.label.toLowerCase()) + ':' + otherChoice.apiName;
            if (thisKey == otherKey) {
                return 0;
            }
            return thisKey < otherKey ? -1 : 1;
        }
    }
}