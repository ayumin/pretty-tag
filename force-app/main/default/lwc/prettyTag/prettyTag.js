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
    @track _showDropdown = false;

    get normalizedConfiguredFieldName() {
        if (!this.fieldApiName) {
            return null;
        }

        const raw = String(this.fieldApiName).trim();
        if (!raw) {
            return null;
        }

        return raw.includes('.') ? raw.split('.').pop() : raw;
    }

    get resolvedFieldApiName() {
        const configuredName = this.normalizedConfiguredFieldName;
        if (!configuredName) {
            return null;
        }

        const fields = this.objectInfo?.data?.fields;
        if (!fields) {
            return configuredName;
        }

        if (fields[configuredName]) {
            return configuredName;
        }

        const directCaseInsensitive = Object.keys(fields).find(
            key => key.toLowerCase() === configuredName.toLowerCase()
        );
        if (directCaseInsensitive) {
            return directCaseInsensitive;
        }

        const targetLabel = configuredName.toLowerCase();
        const matchedEntry = Object.entries(fields).find(([, fieldDef]) => {
            const label = String(fieldDef?.label ?? '').trim().toLowerCase();
            const dataType = String(fieldDef?.dataType ?? '').toLowerCase();
            const isMultiPicklist = dataType === 'multipicklist' || dataType === 'multiselectpicklist';
            return label === targetLabel && isMultiPicklist;
        });

        return matchedEntry ? matchedEntry[0] : configuredName;
    }

    get _fields() {
        if (this.objectApiName && this.resolvedFieldApiName) {
            return [`${this.objectApiName}.${this.resolvedFieldApiName}`];
        }
        return [];
    }

    get _fieldDescriptor() {
        if (this.objectApiName && this.resolvedFieldApiName) {
            return `${this.objectApiName}.${this.resolvedFieldApiName}`;
        }
        return null;
    }

    @wire(getRecord, { recordId: '$recordId', fields: '$_fields' })
    wiredRecord({ data }) {
        if (data) {
            const raw = data.fields[this.resolvedFieldApiName]?.value ?? '';
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
        const labelMap = new Map((this.picklistValues?.data?.values ?? []).map(option => [option.value, option.label]));

        return this.selectedValues.map((value, i) => {
            const displayLabel = labelMap.get(value) ?? value;
            return {
                id: `${value}-${i}`,
                value,
                label: displayLabel,
                colorClass: `slds-badge tag-item ${COLOR_CLASSES[colorIndexForValue(value)]}`,
            };
        });
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

    toggleDropdown() {
        this._showDropdown = true;
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
        this._showDropdown = false;
        this._save();
    }

    _save() {
        const targetField = this.resolvedFieldApiName;
        if (!targetField) {
            return;
        }

        const fields = {
            Id: this.recordId,
            [targetField]: this._selectedValues.join(';'),
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
