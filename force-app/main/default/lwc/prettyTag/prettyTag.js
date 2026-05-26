import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const COLOR_CLASSES = [
    'tag-color-1',  'tag-color-2',  'tag-color-3',  'tag-color-4',
    'tag-color-5',  'tag-color-6',  'tag-color-7',  'tag-color-8',
    'tag-color-9',  'tag-color-10', 'tag-color-11', 'tag-color-12',
    'tag-color-13', 'tag-color-14', 'tag-color-15', 'tag-color-16',
    'tag-color-17', 'tag-color-18', 'tag-color-19', 'tag-color-20',
    'tag-color-21', 'tag-color-22', 'tag-color-23', 'tag-color-24',
    'tag-color-25', 'tag-color-26', 'tag-color-27', 'tag-color-28',
    'tag-color-29', 'tag-color-30', 'tag-color-31', 'tag-color-32',
    'tag-color-33', 'tag-color-34', 'tag-color-35', 'tag-color-36',
];

function colorIndexForValue(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash % COLOR_CLASSES.length;
}

export default class PrettyTag extends LightningElement {
    @api recordId;
    @api objectApiName;
    @api fieldApiName;
    @api label;

    @track _selectedValues = null;
    @track _fieldDescriptor = null;

    get _fields() {
        if (this.objectApiName && this.fieldApiName) {
            return [`${this.objectApiName}.${this.fieldApiName}`];
        }
        return [];
    }

    connectedCallback() {
        if (this.objectApiName && this.fieldApiName) {
            this._fieldDescriptor = `${this.objectApiName}.${this.fieldApiName}`;
        }
    }

    @wire(getRecord, { recordId: '$recordId', fields: '$_fields' })
    wiredRecord({ data }) {
        if (data) {
            const raw = data.fields[this.fieldApiName]?.value ?? '';
            this._selectedValues = raw ? raw.split(';').map(v => v.trim()).filter(Boolean) : [];
        }
    }

    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: '$_fieldDescriptor',
    })
    picklistValues;

    get selectedValues() {
        return this._selectedValues ?? [];
    }

    get tagItems() {
        return this.selectedValues.map((v, i) => ({
            id: `${v}-${i}`,
            label: v,
            colorClass: `slds-badge tag-item ${COLOR_CLASSES[colorIndexForValue(v)]}`,
        }));
    }

    get hasTags() {
        return this.tagItems.length > 0;
    }

    get availableOptions() {
        const all = this.picklistValues?.data?.values ?? [];
        return all
            .filter(o => !this.selectedValues.includes(o.value))
            .map(o => ({ label: o.label, value: o.value }));
    }

    get hasOptions() {
        return this.availableOptions.length > 0;
    }

    removeTag(event) {
        const valueToRemove = event.currentTarget.dataset.value;
        this._selectedValues = this.selectedValues.filter(v => v !== valueToRemove);
        this._save();
    }

    addTag(event) {
        const valueToAdd = event.detail.value;
        if (!valueToAdd) return;
        this._selectedValues = [...this.selectedValues, valueToAdd];
        this._save();
    }

    _save() {
        const fields = {
            Id: this.recordId,
            [this.fieldApiName]: this._selectedValues.join(';'),
        };
        updateRecord({ fields })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({ title: '保存しました', variant: 'success' }));
            })
            .catch(e => {
                this.dispatchEvent(new ShowToastEvent({ title: '保存に失敗しました', message: e.body?.message, variant: 'error' }));
            });
    }
}
