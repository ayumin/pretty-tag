# pretty-tag

Salesforce の MultiselectPicklist（複数選択リスト）項目を、カラフルなタグバッジとして表示・編集できる Lightning Web Component です。

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 機能

- MultiselectPicklist の値をシンプルなカラータグとして表示
- タグごとに固定色（36色、値のハッシュで決定するため常に同じ色）
- タグの **✕** クリックで即削除・保存
- コンボボックスから未選択の値を即追加・保存
- Salesforce Lightning Design System（SLDS）に準拠したスタイリング

## リリースノート

### 0.1.2（2026-05-29）

- App Builder の `Multiple Picklist Field` を API 名手入力から表示ラベル選択に変更
- Dynamic Picklist 用 Apex クラスを追加し、対象オブジェクトの Multiple Picklist 項目を自動列挙
- 既存ページ設定の互換対応を追加（`Tags` / `tags__c` / `Account.Tags__c` の表記揺れを吸収）
- タグ未選択時のプレースホルダー表示を削除
- Apex テストを追加し `PrettyTagMultiPicklistFieldProvider` のクラスカバレッジ 100%
- LWC テストを拡張し `prettyTag.js` の Line/Statement/Function カバレッジ 100%

## インストール

### Unlocked Package（推奨）

以下の URL をブラウザで開くか、CLI コマンドを実行してください。

**インストール URL：**
```
https://login.salesforce.com/packaging/installPackage.apexp?p0=04tQ80000003Q1BIAU
```

**CLI：**
```bash
sf package install --package 04tQ80000003Q1BIAU --target-org <org-alias> --wait 10
```

### ソースからデプロイ

```bash
git clone https://github.com/ayumin/pretty-tag.git
cd pretty-tag
sf project deploy start --target-org <org-alias>
```

## 使い方

1. Lightning App Builder でレコードページを開く
2. コンポーネント一覧から `prettyTag` をページにドラッグ
3. プロパティパネルで以下を設定：

| プロパティ | 説明 | 例 |
|---|---|---|
| **Multiple Picklist Field** | 対象オブジェクトの Multiple Picklist 項目を表示ラベルから選択 | `タグ`（ラベル） |
| **Label** | タグ一覧の上に表示するラベル（省略可） | `タグ` |

4. 保存・有効化

> `recordId` と `objectApiName` はレコードページから自動注入されます。

## 動作要件

- Salesforce API バージョン 66.0 以上
- Lightning Experience

## ローカル開発

```bash
# 依存パッケージのインストール
npm install

# テスト実行
npm run test:unit

# スクラッチ org を作成してデプロイ
sf org create scratch --definition-file config/project-scratch-def.json --alias dev --set-default
sf project deploy start --target-org dev
sf org open --target-org dev
```

## ライセンス

MIT
