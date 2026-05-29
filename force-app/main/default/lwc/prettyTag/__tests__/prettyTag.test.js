import { createElement } from '@lwc/engine-dom';
import PrettyTag from 'c/prettyTag';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

jest.mock(
    'lightning/uiRecordApi',
    () => {
        const { createLdsTestWireAdapter } = require('@salesforce/wire-service-jest-util');
        return {
            getRecord: createLdsTestWireAdapter(jest.fn()),
            updateRecord: jest.fn(),
        };
    },
    { virtual: true }
);

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
    defaultRecordTypeId: '012000000000000AAA',
    fields: {
        Tags__c: {
            label: 'Tags',
            dataType: 'Multipicklist'
        }
    }
};

const flushPromises = () => Promise.resolve();

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

    it('fieldApiName が Object.Field の形式でも表示できる', async () => {
        const element = createElement('c-pretty-tag', { is: PrettyTag });
        element.recordId = 'a01000000000001';
        element.objectApiName = 'Account';
        element.fieldApiName = 'Account.Tags__c';
        document.body.appendChild(element);

        getObjectInfo.emit(MOCK_OBJECT_INFO);
        getRecord.emit(MOCK_RECORD);
        getPicklistValues.emit(MOCK_PICKLIST);

        await flushPromises();

        const badges = element.shadowRoot.querySelectorAll('.tag-item');
        expect(badges.length).toBe(3);
    });

    it('fieldApiName が大文字小文字違いでも API 名に解決できる', async () => {
        const element = createElement('c-pretty-tag', { is: PrettyTag });
        element.recordId = 'a01000000000001';
        element.objectApiName = 'Account';
        element.fieldApiName = 'tags__c';
        document.body.appendChild(element);

        getObjectInfo.emit(MOCK_OBJECT_INFO);
        getRecord.emit(MOCK_RECORD);
        getPicklistValues.emit(MOCK_PICKLIST);

        await flushPromises();

        const badges = element.shadowRoot.querySelectorAll('.tag-item');
        expect(badges.length).toBe(3);
    });

    it('タグが空のときプレースホルダーを表示しない', async () => {
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
        expect(placeholder).toBeNull();
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

    it('項目ラベル指定でも API 名に解決してタグ表示できる', async () => {
        const element = createElement('c-pretty-tag', { is: PrettyTag });
        element.recordId = 'a01000000000001';
        element.objectApiName = 'Account';
        element.fieldApiName = 'Tags';
        document.body.appendChild(element);

        getObjectInfo.emit(MOCK_OBJECT_INFO);
        getRecord.emit(MOCK_RECORD);
        getPicklistValues.emit(MOCK_PICKLIST);

        await Promise.resolve();

        const badges = element.shadowRoot.querySelectorAll('.tag-item');
        expect(badges.length).toBe(3);
        expect(badges[0].textContent).toContain('Technology');
    });

    it('タグ追加で updateRecord が呼ばれ成功トーストを出す', async () => {
        updateRecord.mockResolvedValue({});
        const element = createElement('c-pretty-tag', { is: PrettyTag });
        element.recordId = 'a01000000000001';
        element.objectApiName = 'Account';
        element.fieldApiName = 'Tags__c';
        document.body.appendChild(element);

        const dispatchSpy = jest.spyOn(element, 'dispatchEvent');

        getObjectInfo.emit(MOCK_OBJECT_INFO);
        getRecord.emit({ fields: { Tags__c: { value: null } } });
        getPicklistValues.emit(MOCK_PICKLIST);

        await flushPromises();

        const addButton = element.shadowRoot.querySelector('.add-tag-btn');
        addButton.click();
        await flushPromises();

        const combobox = element.shadowRoot.querySelector('lightning-combobox');
        combobox.dispatchEvent(new CustomEvent('change', { detail: { value: 'Education' } }));

        await flushPromises();
        await flushPromises();

        expect(updateRecord).toHaveBeenCalledTimes(1);
        expect(updateRecord).toHaveBeenCalledWith({
            fields: {
                Id: 'a01000000000001',
                Tags__c: 'Education',
            },
        });
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('タグ削除で updateRecord が呼ばれ失敗トーストを出す', async () => {
        updateRecord.mockRejectedValue({ body: { message: 'save failed' } });
        const element = createElement('c-pretty-tag', { is: PrettyTag });
        element.recordId = 'a01000000000001';
        element.objectApiName = 'Account';
        element.fieldApiName = 'Tags__c';
        document.body.appendChild(element);

        const dispatchSpy = jest.spyOn(element, 'dispatchEvent');

        getObjectInfo.emit(MOCK_OBJECT_INFO);
        getRecord.emit(MOCK_RECORD);
        getPicklistValues.emit(MOCK_PICKLIST);

        await flushPromises();

        const removeButton = element.shadowRoot.querySelector('.tag-remove-btn');
        removeButton.click();

        await flushPromises();
        await flushPromises();

        expect(updateRecord).toHaveBeenCalledTimes(1);
        expect(updateRecord.mock.calls[0][0].fields.Tags__c).toBe('Finance;Healthcare');
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('空値の追加は無視される', async () => {
        updateRecord.mockResolvedValue({});
        const element = createElement('c-pretty-tag', { is: PrettyTag });
        element.recordId = 'a01000000000001';
        element.objectApiName = 'Account';
        element.fieldApiName = 'Tags__c';
        document.body.appendChild(element);

        getObjectInfo.emit(MOCK_OBJECT_INFO);
        getRecord.emit({ fields: { Tags__c: { value: null } } });
        getPicklistValues.emit(MOCK_PICKLIST);

        await flushPromises();

        const addButton = element.shadowRoot.querySelector('.add-tag-btn');
        addButton.click();
        await flushPromises();

        const combobox = element.shadowRoot.querySelector('lightning-combobox');
        combobox.dispatchEvent(new CustomEvent('change', { detail: { value: '' } }));

        await flushPromises();

        expect(updateRecord).not.toHaveBeenCalled();
    });

    it('fieldApiName 未設定時は追加操作しても保存しない', async () => {
        updateRecord.mockResolvedValue({});
        const element = createElement('c-pretty-tag', { is: PrettyTag });
        element.recordId = 'a01000000000001';
        element.objectApiName = 'Account';
        element.fieldApiName = '';
        document.body.appendChild(element);

        getObjectInfo.emit({ defaultRecordTypeId: '012000000000000AAA' });
        getPicklistValues.emit(MOCK_PICKLIST);

        await flushPromises();

        const addButton = element.shadowRoot.querySelector('.add-tag-btn');
        addButton.click();
        await flushPromises();

        const combobox = element.shadowRoot.querySelector('lightning-combobox');
        combobox.dispatchEvent(new CustomEvent('change', { detail: { value: 'Education' } }));

        await flushPromises();

        expect(updateRecord).not.toHaveBeenCalled();
    });

    it('objectInfo.fields がなくても configuredName で表示できる', async () => {
        const element = createElement('c-pretty-tag', { is: PrettyTag });
        element.recordId = 'a01000000000001';
        element.objectApiName = 'Account';
        element.fieldApiName = 'Tags__c';
        document.body.appendChild(element);

        getObjectInfo.emit({ defaultRecordTypeId: '012000000000000AAA' });
        getRecord.emit(MOCK_RECORD);
        getPicklistValues.emit(MOCK_PICKLIST);

        await flushPromises();

        const badges = element.shadowRoot.querySelectorAll('.tag-item');
        expect(badges.length).toBe(3);
    });

    it('fieldApiName が空白のみなら保存しない', async () => {
        updateRecord.mockResolvedValue({});
        const element = createElement('c-pretty-tag', { is: PrettyTag });
        element.recordId = 'a01000000000001';
        element.objectApiName = 'Account';
        element.fieldApiName = '   ';
        document.body.appendChild(element);

        getObjectInfo.emit({ defaultRecordTypeId: '012000000000000AAA' });
        getPicklistValues.emit(MOCK_PICKLIST);

        await flushPromises();

        const addButton = element.shadowRoot.querySelector('.add-tag-btn');
        addButton.click();
        await flushPromises();

        const combobox = element.shadowRoot.querySelector('lightning-combobox');
        combobox.dispatchEvent(new CustomEvent('change', { detail: { value: 'Education' } }));

        await flushPromises();

        expect(updateRecord).not.toHaveBeenCalled();
    });
});
