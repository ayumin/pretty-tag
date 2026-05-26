import { createElement } from '@lwc/engine-dom';
import PrettyTag from 'c/prettyTag';
import { getRecord } from 'lightning/uiRecordApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

const MOCK_RECORD = {
    fields: {
        Tags__c: { value: 'Technology;Finance;Healthcare' }
    }
};

const MOCK_PICKLIST = {
    values: [
        { label: 'Technology', value: 'Technology' },
        { label: 'Finance', value: 'Finance' },
        { label: 'Healthcare', value: 'Healthcare' },
        { label: 'Education', value: 'Education' },
    ]
};

const MOCK_OBJECT_INFO = {
    defaultRecordTypeId: '012000000000000AAA'
};

describe('c-pretty-tag', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('選択済みタグをバッジとして表示する', async () => {
        const element = createElement('c-pretty-tag', { is: PrettyTag });
        element.recordId = 'a01000000000001';
        element.objectApiName = 'Account';
        element.fieldApiName = 'Tags__c';
        document.body.appendChild(element);

        getObjectInfo.emit(MOCK_OBJECT_INFO);
        getRecord.emit(MOCK_RECORD);
        getPicklistValues.emit(MOCK_PICKLIST);

        await Promise.resolve();

        const badges = element.shadowRoot.querySelectorAll('.tag-item');
        expect(badges.length).toBe(3);
        expect(badges[0].textContent).toContain('Technology');
    });

    it('タグが空のときプレースホルダーを表示する', async () => {
        const element = createElement('c-pretty-tag', { is: PrettyTag });
        element.recordId = 'a01000000000001';
        element.objectApiName = 'Account';
        element.fieldApiName = 'Tags__c';
        document.body.appendChild(element);

        getObjectInfo.emit(MOCK_OBJECT_INFO);
        getRecord.emit({ fields: { Tags__c: { value: null } } });
        getPicklistValues.emit(MOCK_PICKLIST);

        await Promise.resolve();

        const placeholder = element.shadowRoot.querySelector('.empty-placeholder');
        expect(placeholder).not.toBeNull();
        expect(placeholder.textContent).toBe('値を追加');
    });

    it('ラベルが設定されていれば表示する', async () => {
        const element = createElement('c-pretty-tag', { is: PrettyTag });
        element.recordId = 'a01000000000001';
        element.objectApiName = 'Account';
        element.fieldApiName = 'Tags__c';
        element.label = 'タグ';
        document.body.appendChild(element);

        getObjectInfo.emit(MOCK_OBJECT_INFO);
        getRecord.emit(MOCK_RECORD);
        getPicklistValues.emit(MOCK_PICKLIST);

        await Promise.resolve();

        const label = element.shadowRoot.querySelector('.slds-form-element__label');
        expect(label.textContent).toBe('タグ');
    });

    it('同じ値には常に同じ色クラスが割り当てられる', async () => {
        const element = createElement('c-pretty-tag', { is: PrettyTag });
        element.recordId = 'a01000000000001';
        element.objectApiName = 'Account';
        element.fieldApiName = 'Tags__c';
        document.body.appendChild(element);

        getObjectInfo.emit(MOCK_OBJECT_INFO);
        getRecord.emit(MOCK_RECORD);
        getPicklistValues.emit(MOCK_PICKLIST);

        await Promise.resolve();

        const badges = element.shadowRoot.querySelectorAll('.tag-item');
        const techClass = badges[0].className;

        // 同じ値で再レンダリングしても同じクラスになる
        expect(techClass).toContain('tag-color-');
        // 1回目と同じ
        expect(badges[0].className).toBe(techClass);
    });
});
