# CSV Visualizer — Coding Agent 開發規格

你現在是一名資深前端 / Desktop Application 工程師。

請在目前專案中開發一個 **CSV 資料視覺化與資料探索工具（CSV Visualizer）**。

你的目標不是單純製作 CSV Viewer，而是建立一個讓使用者：

> 匯入 CSV → 理解資料 → 修改欄位語意 → 篩選 / 排序 → 查看統計 → 視覺化 → 匯出

的完整資料探索工具。

---

# 0. 開始工作前的重要規則

在修改任何程式碼之前：

1. 先檢查目前專案的檔案結構。
2. 判斷目前使用的 framework、package manager、CSS framework 與 build system。
3. 閱讀現有的 README、package.json、設定檔以及主要 source files。
4. **不要因為偏好其他技術而重建現有專案。**
5. 如果專案已經使用 Svelte / SvelteKit，優先沿用。
6. 如果專案已有 UI component system，優先沿用。
7. 如果現有架構合理，不要大幅重構。
8. 修改前先說明你準備修改哪些檔案，以及原因。
9. 每完成一個階段後先執行適當的 type check / lint / build / test。
10. 發現錯誤時先修復，不要繼續堆疊新功能。

---

# 1. Product Goal

建立一個現代化的 CSV Data Explorer。

核心概念：

```text
CSV
 ↓
Parse
 ↓
Dataset
 ↓
Data Table
 ↓
Column Metadata
 ↓
Filter / Sort / Search
 ↓
Statistics
 ↓
Visualization
 ↓
Export
```

應用程式應該給使用者這種感覺：

> 「我丟進一個原本很難讀的 CSV，程式幫我把它變成一個可以理解與分析的資料集。」

---

# 2. 技術原則

如果專案沒有既定技術棧，優先使用：

* Svelte / SvelteKit
* TypeScript
* Tailwind CSS
* 成熟的 CSV parser
* ECharts 或其他成熟 visualization library

如果目前專案不是這個技術棧：

**不要直接重建專案。**

先分析現有架構，再採用與現有專案相容的方案。

所有基本 CSV 處理應盡可能在本機完成。

不要把使用者 CSV 上傳到第三方服務。

---

# 3. Architecture

將系統拆成以下幾個邏輯層：

```text
src/
├── components/
│   ├── csv/
│   │   ├── CsvDropzone
│   │   ├── DataTable
│   │   ├── DataTableHeader
│   │   ├── DataTableRow
│   │   ├── ColumnSettings
│   │   └── FilterBuilder
│   │
│   ├── visualization/
│   │   ├── ChartPanel
│   │   ├── ChartConfigurator
│   │   └── ChartRenderer
│   │
│   ├── statistics/
│   │   └── StatisticsPanel
│   │
│   └── layout/
│       ├── Sidebar
│       ├── Toolbar
│       └── StatusBar
│
├── lib/
│   ├── csv/
│   │   ├── parser
│   │   ├── typeDetection
│   │   └── export
│   │
│   ├── data/
│   │   ├── types
│   │   ├── filtering
│   │   ├── sorting
│   │   └── statistics
│   │
│   └── visualization/
│       └── chartConfig
│
└── stores/
    ├── dataset
    ├── columns
    ├── filters
    └── visualization
```

上述結構是「建議的邏輯結構」，不是要求你無條件建立完全相同的檔案。

如果目前專案已有合理的 architecture，請整合進現有 architecture。

---

# 4. Core Data Model

不要把 CSV 的 raw data 與 UI metadata 混在一起。

建立清楚的資料模型。

概念：

```ts
type DataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'category';
```

Column：

```ts
interface ColumnDefinition {
  id: string;

  originalName: string;

  displayName: string;

  dataType: DataType;

  description?: string;

  unit?: string;

  hidden: boolean;

  width?: number;

  decimalPlaces?: number;

  dateFormat?: string;
}
```

Dataset：

```ts
interface Dataset {
  name: string;

  columns: ColumnDefinition[];

  rows: Record<string, unknown>[];

  rowCount: number;
}
```

實際型別可以依專案需求調整。

重要原則：

```text
originalName ≠ displayName
```

使用者重新命名欄位時：

**不能破壞原始資料欄位識別。**

---

# 5. CSV Import

實作 CSV 匯入。

支援：

* File picker
* Drag & Drop

匯入後：

```text
filename
row count
column count
columns
data preview
```

例如：

```csv
usr_id,usr_nm,reg_dt,amt,st
001,Alice,2026-01-01,1250,TW
002,Bob,2026-01-02,830,JP
003,Charlie,2026-01-03,2100,TW
```

應建立：

```text
5 columns
3 rows
```

並顯示 Data Table。

---

# 6. CSV Parsing

不要自己實作完整 CSV parser，除非現有專案有特殊需求。

CSV parser 必須正確處理至少：

* comma
* quoted fields
* commas inside quotes
* empty values
* newline
* UTF-8
* header row

例如：

```csv
name,description
Alice,"Hello, world"
```

不能錯誤切成三個欄位。

---

# 7. Automatic Type Detection

CSV 匯入後，嘗試自動判斷欄位型別。

例如：

```text
123
456
789
```

→ number

```text
2026-01-01
2026-01-02
```

→ date

```text
true
false
```

→ boolean

只有在具有足夠信心時才自動轉換。

不要因為一兩個值看起來像數字，就錯誤判斷整個欄位。

永遠允許使用者手動修改 Data Type。

---

# 8. Data Table

Data Table 是整個應用程式最重要的 UI。

需要：

* sticky header
* horizontal scrolling
* column resizing
* column reordering
* column hiding
* sorting
* search
* filtering
* row count
* loading state
* empty state

大量資料時：

**不要直接把所有 row 一次 render 成 DOM。**

使用：

* virtual scrolling
* pagination

或其他合理方案。

優先保證：

```text
UI 不因資料量增加而明顯卡頓
```

---

# 9. Column Rename

使用者可以直接修改：

```text
originalName
```

對應的：

```text
displayName
```

例如：

```text
usr_nm
↓
User Name
```

Data Table 應立即更新。

Column Settings 中必須讓使用者看到：

```text
Original Name
Display Name
Data Type
Description
Unit
```

---

# 10. Column Settings

建立 Column Settings UI。

至少支援：

### Display Name

修改使用者看到的欄位名稱。

### Data Type

```text
String
Number
Boolean
Date
Datetime
Category
```

### Description

讓使用者輸入：

```text
The amount paid by the customer.
```

### Unit

例如：

```text
TWD
kg
ms
%
```

### Decimal Places

Number 欄位可以設定顯示的小數位數。

### Hide

隱藏欄位。

注意：

**Hide 不等於刪除。**

---

# 11. Search

提供全域資料搜尋。

例如：

```text
Search data...
```

搜尋目前 Dataset。

應搜尋所有可見欄位。

結果即時更新。

---

# 12. Sorting

點擊欄位 header 可以：

```text
None
 ↓
Ascending
 ↓
Descending
 ↓
None
```

Number、String、Date 必須依型別進行合理排序。

不要把：

```text
2
10
100
```

當成：

```text
10
100
2
```

進行字串排序。

---

# 13. Filtering

建立 Filter Builder。

基本格式：

```text
Column
Operator
Value
```

Number：

```text
equals
not equals
greater than
less than
greater than or equal
less than or equal
between
```

String：

```text
equals
contains
starts with
ends with
```

Category：

```text
is
is not
```

Date：

```text
before
after
between
```

支援：

```text
AND
OR
```

篩選後：

* Data Table 更新
* row count 更新
* statistics 更新
* visualization 更新

---

# 14. Statistics

選擇 Number 欄位時提供：

```text
Count
Mean
Median
Min
Max
Sum
```

Category：

```text
Unique values
Most common values
```

所有 statistics 必須基於：

**目前篩選後的資料。**

不是原始資料。

---

# 15. Data Quality

Dataset level：

```text
Rows
Columns
Missing Values
Duplicate Rows
```

Column level：

```text
Missing
Unique
Data Type
```

例如：

```text
Amount

Type       Number
Missing    2
Unique     1,102
```

第一版可以先做基本統計，不需要實作複雜資料品質分析。

---

# 16. Visualization

建立 Visualization Tab。

最少支援：

```text
Bar Chart
Line Chart
Scatter Plot
Pie Chart
```

使用者可以指定：

```text
Chart Type
X Axis
Y Axis
Group By
```

例如：

```text
Chart Type
Bar

X Axis
Country

Y Axis
Amount
```

---

# 17. Smart Chart Suggestions

根據資料型別提供合理建議。

例如：

```text
Category + Number
→ Bar Chart

Date + Number
→ Line Chart

Number + Number
→ Scatter Plot

Category + Number
→ Pie / Bar
```

這只是 suggestion。

使用者仍然可以手動選擇。

---

# 18. Visualization State

Visualization configuration 必須獨立於 dataset。

概念：

```ts
interface VisualizationConfig {
  chartType: ChartType;

  xColumn?: string;

  yColumn?: string;

  groupBy?: string;
}
```

使用者修改 visualization 不應修改 raw data。

---

# 19. Export

提供：

```text
Export CSV
```

Export 結果應依照目前使用者的設定：

* 欄位順序
* display names
* hidden columns
* filters
* current dataset

例如：

原始：

```csv
usr_id,usr_nm,amt
001,Alice,1250
```

使用者重新命名：

```text
usr_id → User ID
usr_nm → User Name
amt → Amount
```

Export：

```csv
User ID,User Name,Amount
001,Alice,1250
```

---

# 20. Undo / Redo

優先支援以下操作：

```text
Rename column
Change data type
Hide column
Reorder column
Sort
Filter
```

Undo / Redo 應該只影響 application state。

不要直接修改原始檔案。

---

# 21. Layout

Desktop-first。

主要 layout：

```text
┌─────────────────────────────────────────────────────┐
│ CSV Visualizer                         Open CSV     │
├───────────────┬─────────────────────────────────────┤
│               │                                     │
│ DATASET       │ users.csv                           │
│               │                                     │
│ Columns       │ ┌─────────────────────────────────┐ │
│               │ │ User ID │ Name │ Amount │ ...  │ │
│ User ID       │ ├─────────────────────────────────┤ │
│ User Name     │ │ 001     │ Alice│ 1250   │ ...  │ │
│ Amount        │ │ 002     │ Bob  │ 830    │ ...  │ │
│ Country       │ │ 003     │ Carl │ 2100   │ ...  │ │
│               │ └─────────────────────────────────┘ │
│               │                                     │
├───────────────┴─────────────────────────────────────┤
│ Table     Visualization     Statistics              │
└─────────────────────────────────────────────────────┘
```

---

# 22. UI Design

視覺風格：

* modern
* clean
* minimal
* professional
* data-oriented

參考：

```text
Linear
Vercel
Notion
Observable
modern analytics dashboards
```

避免：

* 過度裝飾
* 大量 gradient
* 巨大的文字
* 不必要動畫
* 過多顏色
* Excel 2000 年代風格

支援：

```text
Light Mode
Dark Mode
```

優先使用現有 design system。

---

# 23. Empty State

第一次開啟時，不應該是一大片空白。

顯示：

```text
CSV Visualizer

Explore your data locally.

[ Open CSV ]

or

Drop a CSV file here
```

另外可以顯示簡短說明：

```text
Import a CSV to inspect columns,
filter data, view statistics,
and create visualizations.
```

---

# 24. Loading / Error State

必須處理：

* invalid CSV
* empty CSV
* malformed CSV
* unsupported file
* parsing error
* extremely large file

錯誤訊息要讓普通使用者看得懂。

不要只顯示：

```text
Error: ParserException
```

而應該例如：

```text
Unable to read this CSV.

The file appears to contain inconsistent
columns around row 142.
```

如果可以定位錯誤，提供 row number。

---

# 25. Performance

優先考慮：

```text
10,000 rows
50,000 rows
100,000+ rows
```

不要假設 CSV 永遠只有幾百筆資料。

避免：

```text
O(rows × columns × unnecessary rerenders)
```

造成 UI 卡頓。

Data Table 優先使用 virtualization。

Statistics 與 filtering 如果資料量很大，考慮合理的 memoization / derived state。

不要為了 premature optimization 把架構弄得過度複雜。

---

# 26. State Management

所有重要狀態應集中管理。

至少包括：

```text
dataset
columns
filters
sorting
search
selectedColumn
visualization
theme
```

不要讓不同 component 各自維護互相衝突的 Dataset state。

建立清楚的 single source of truth。

---

# 27. 原始資料不可破壞

這是重要要求。

使用者做：

```text
Rename
Filter
Sort
Hide
Change display settings
```

都不能修改原始 CSV 檔案。

概念：

```text
Raw Data
   │
   ├── Column Metadata
   ├── Filter State
   ├── Sort State
   └── Visualization State
```

只有使用者按下：

```text
Export CSV
```

才產生新的 CSV。

---

# 28. Accessibility

基本 accessibility：

* keyboard navigation
* visible focus state
* semantic buttons
* semantic inputs
* labels
* tooltips where necessary
* sufficient contrast

不要把所有 clickable UI 都做成 `<div>`。

---

# 29. Testing

至少測試：

### CSV Parser

```text
normal CSV
quoted values
comma inside quoted value
empty values
UTF-8
different row lengths
```

### Type Detection

```text
number
string
boolean
date
empty column
mixed column
```

### Filtering

```text
number filter
string filter
date filter
AND
OR
```

### Sorting

```text
number
string
date
ascending
descending
```

### Statistics

```text
count
mean
median
min
max
sum
missing values
```

如果專案已有測試框架，沿用。

---

# 30. Development Order

嚴格按照以下順序。

## Phase 0 — Inspect

先分析：

```text
project structure
package.json
framework
dependencies
existing components
existing styling
build system
```

不要修改程式。

---

## Phase 1 — Dataset Core

完成：

```text
CSV parser
Dataset model
ColumnDefinition
type detection
basic state
```

驗收：

```text
CSV → Dataset
```

可以正確建立。

---

## Phase 2 — Table

完成：

```text
Data Table
Column headers
Rows
Scrolling
Sorting
Search
```

驗收：

使用者可以正常閱讀 CSV。

---

## Phase 3 — Column Metadata

完成：

```text
Rename
Data Type
Description
Unit
Hide
Column width
```

驗收：

使用者可以把：

```text
usr_nm
amt
reg_dt
```

變成：

```text
User Name
Amount
Registration Date
```

而不破壞 raw data。

---

## Phase 4 — Filter

完成：

```text
Filter Builder
AND
OR
Type-aware operators
```

驗收：

Filtering 可以即時更新 table。

---

## Phase 5 — Statistics

完成：

```text
Count
Mean
Median
Min
Max
Sum
Missing
Unique
```

統計必須基於目前 dataset view。

---

## Phase 6 — Visualization

完成：

```text
Bar
Line
Scatter
Pie
```

以及：

```text
X Axis
Y Axis
Group By
```

---

## Phase 7 — Export

完成：

```text
Export CSV
```

確認：

```text
display names
column order
filters
hidden columns
```

都正確反映。

---

## Phase 8 — Undo / Redo

加入：

```text
Undo
Redo
```

---

## Phase 9 — Polish

最後才處理：

```text
animations
micro interactions
empty states
error states
dark mode
responsive behavior
performance
accessibility
```

不要在 Phase 1 就花大量時間做動畫。

---

# 31. Definition of Done

功能只有在以下條件全部成立時才算完成：

### Import

```text
✓ CSV 可以載入
✓ UTF-8 正常
✓ quoted field 正常
✓ 空值正常
✓ malformed CSV 有錯誤訊息
```

### Table

```text
✓ 可以閱讀資料
✓ 可以排序
✓ 可以搜尋
✓ 可以調整欄位
✓ 大量資料不會因 DOM 過量而卡死
```

### Columns

```text
✓ 可以重新命名
✓ 可以修改型別
✓ 可以隱藏
✓ 可以設定 description
✓ originalName 不會遺失
```

### Filter

```text
✓ Number
✓ String
✓ Date
✓ AND / OR
```

### Statistics

```text
✓ Count
✓ Mean
✓ Median
✓ Min
✓ Max
✓ Sum
✓ Missing
✓ Unique
```

### Visualization

```text
✓ Bar
✓ Line
✓ Scatter
✓ Pie
```

### Export

```text
✓ 可以輸出 CSV
✓ 欄位名稱正確
✓ 欄位順序正確
✓ Filter 結果正確
```

---

# 32. Agent 行為規範

非常重要：

## 不要

* 不要一次修改整個專案
* 不要刪除現有功能
* 不要無理由更換 framework
* 不要引入大型 dependency 解決簡單問題
* 不要過度抽象
* 不要先做動畫
* 不要建立沒有實際用途的 component
* 不要假設 CSV 一定很小
* 不要把 raw data 與 UI metadata 混在一起

## 要

* 先理解現有專案
* 小步驟修改
* 每個階段驗證
* 保持 TypeScript type safety
* 保持 component responsibility 清楚
* 優先使用現有 dependencies
* 遇到架構問題先解決根本原因
* 保持 UI 與 data logic 分離

---

# 33. 執行指令

現在開始。

第一步：

**只檢查目前專案，不要修改任何檔案。**

請回報：

1. 專案使用的 framework
2. package manager
3. 目前主要 dependencies
4. 現有目錄結構
5. 可以重用的 component / utility
6. 你建議新增或修改哪些檔案
7. 目前架構是否需要調整

完成分析後，再開始 Phase 1。

不要跳過 Phase 0。
