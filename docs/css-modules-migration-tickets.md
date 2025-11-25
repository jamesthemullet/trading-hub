# CSS Modules Migration - Jira Tickets

## Epic: Migrate from Emotion to CSS Modules

**Goal**: Replace Emotion styled-components with CSS Modules across the entire application to match onyx, and make for a smoother migrationto onyx, should this be required. Also for better performance, smaller bundle size, and improved maintainability.

---

## Phase 1: Foundation & Setup

### Ticket 1: Setup CSS Modules Infrastructure

**Components**: N/A (infrastructure)

**Tasks**:

- [x] Install `typescript-plugin-css-modules`
- [x] Update tsconfig.json with CSS modules plugin
- [x] Create `src/libs/styles/globals.css` with design tokens
- [x] Import globals.css in `_app.page.tsx`
- [x] Add eslint rules for CSS modules
- [x] Install and configure stylelint for CSS linting
- [x] FilteredResultsPanel → CSS modules (example)

---

## Phase 2: Low-Hanging Fruit (Pure Presentational)

### Ticket 2: Migrate Typography Components

**Components**: `Text`, `Typography`

**Tasks**:

- [ ] Create typography.module.css with variants
- [ ] Migrate Text component
- [ ] Migrate Typography component
- [ ] Handle `as` prop polymorphism
- [ ] Handle variant prop (all typography variants)
- [ ] **Verify semantic HTML** (ensure correct heading hierarchy, paragraph structure)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

### Ticket 3: Migrate Pure Presentational Components

**Components**: `Loader`, `InfoBox`, `Count`, `Heading`

**Tasks**:

- [ ] Loader → CSS modules
- [ ] InfoBox → CSS modules
- [ ] Count → CSS modules
- [ ] Heading → CSS modules
- [ ] **Create Storybook files** for Loader, InfoBox, Count, Heading and FilteredResultsPanel.
- [ ] **Verify semantic HTML** (use appropriate heading levels, semantic tags)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

### Ticket 4: Migrate Button Component

**Components**: `Button`

**Tasks**:

- [ ] Create button.module.css (primary, secondary, disabled, loading variants)
- [ ] Migrate Button component with all themes/variants
- [ ] Handle polymorphic `as` prop (renders as link, button, etc.)
- [ ] Handle disabled/loading/error states
- [ ] Handle icon buttons
- [ ] Update all Button tests
- [ ] **Verify semantic HTML** (use `button` element, proper type attributes, ARIA for loading states)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

### Ticket 5: Migrate Form Components

**Components**: `Input`, `Checkbox`, `FormLabel`, `RadioButtons`, `Toggle`

**Tasks**:

- [ ] Create input.module.css
- [ ] Migrate Input component (shared/input)
- [ ] Create checkbox.module.css
- [ ] Migrate Checkbox component
- [ ] Migrate Checkboxes styles
- [ ] Migrate FormLabel component
- [ ] Migrate RadioButtons component
- [ ] Migrate Toggle component
- [ ] Handle disabled/error/focus states
- [ ] **Verify semantic HTML** (use `input`, `label`, proper input types, ARIA attributes)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

## Phase 3: Feature Components

### Ticket 6: Migrate Search Components

**Components**: `Search`, `SearchKeywords`

**Tasks**:

- [ ] Create search.module.css
- [ ] Migrate Search component
- [ ] Handle rounded style variant
- [ ] Handle clear button styles
- [ ] Migrate SearchKeywordsModal styles
- [ ] **Create Storybook file** for Search component
- [ ] **Verify semantic HTML** (use `input type="search"`, proper labels)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

### Ticket 7: Migrate Accordion/Disclosure Components

**Components**: `FacetsPanelAccordion`

**Tasks**:

- [ ] Create facets-panel-accordion.module.css
- [ ] Migrate FacetsPanelAccordion
- [ ] Handle open/closed states
- [ ] Handle SVG rotation animation
- [ ] **Create Storybook file** for FacetsPanelAccordion
- [ ] **Verify semantic HTML** (use proper button/heading structure, ARIA expanded states)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

### Ticket 8: Migrate Table Components

**Components**: `TableHeading`, table rows, cells, `DataTable`, `TablePagination`

**Tasks**:

- [ ] Create table.module.css
- [ ] Migrate TableHeading
- [ ] Migrate table.styles.tsx (shared/table)
- [ ] Migrate DataTable component
- [ ] Migrate FacetAttributeValuesTableRow
- [ ] Migrate EditFacetAttributesModalTableRow
- [ ] Migrate TablePagination component
- [ ] Migrate ChevronIcon component
- [ ] Migrate Pagination component
- [ ] Handle row states (pinned, excluded, selected)
- [ ] **Create Storybook files** for TableHeading, DataTable, TablePagination
- [ ] **Verify semantic HTML** (use `table`, `thead`, `tbody`, `th`, `td`, proper scope attributes)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

### Ticket 9: Migrate Dropdown, Tabs, Icons & UI Components

**Components**: `Dropdown`, `Tabs`, `ArrowButton`, `BulkActions`, `OperationSelector`

**Tasks**:

- [ ] Create dropdown.module.css
- [ ] Migrate Dropdown component and dropdown.styles.tsx
- [ ] Create tabs.module.css
- [ ] Migrate Tabs component
- [ ] Migrate ArrowButton component
- [ ] Migrate BulkActions styles
- [ ] Migrate OperationSelector component
- [ ] Handle all dropdown states and variants
- [ ] **Create Storybook files** for Tabs, ArrowButton, BulkActions (Dropdown already has one)
- [ ] **Verify semantic HTML** (use `button`, `select` where appropriate, proper ARIA for custom controls)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

### Ticket 10: Migrate Navigation Components

**Components**: `Navigation`, `NavigationMenu`, breadcrumbs, menu items

**Tasks**:

- [ ] Create navigation.module.css
- [ ] Migrate Navigation component
- [ ] Migrate NavigationMenu component
- [ ] Migrate breadcrumb components (breadcrumb.tsx, list.tsx, visually-hide.tsx)
- [ ] Migrate menu items
- [ ] Handle active/hover states
- [ ] **Create Storybook files** for Navigation, Breadcrumb
- [ ] **Verify semantic HTML** (use `nav`, `ol`/`ul` for breadcrumbs, proper link structure)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

### Ticket 11: Migrate Calendar/Date Picker Components

**Components**: `DatePicker`, `DatePickerSingle`, `DateTimePicker`, calendar styles

**Tasks**:

- [ ] Create date-picker.module.css
- [ ] Migrate DatePicker component
- [ ] Migrate DatePickerSingle component
- [ ] Migrate DateTimePicker component
- [ ] Migrate date-picker.styles.tsx
- [ ] Handle calendar dropdown states
- [ ] Handle date selection styling
- [ ] **Create Storybook files** for DatePicker, DatePickerSingle (DateTimePickerModal already has one)
- [ ] **Verify semantic HTML** (use proper input types, labels, ARIA for calendar widget)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

### Ticket 12: Migrate Modal Components

**Components**: `ConfirmationModal`, `DateTimePickerModal`, `ModalUnsavedChanges`, modal wrappers

**Tasks**:

- [ ] Create modal.module.css
- [ ] Migrate modal.styles.tsx
- [ ] Migrate ConfirmationModal
- [ ] Migrate DateTimePickerModal
- [ ] Migrate ModalUnsavedChanges
- [ ] Migrate modal header/footer/body wrappers
- [ ] Migrate EditFacetModalContent styles
- [ ] Handle overlay/backdrop styles
- [ ] **Verify semantic HTML** (use `dialog` or proper modal ARIA roles, focus management)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

## Phase 4: Complex Feature Modules

### Ticket 13: Migrate Ruleset Components & Attributes

**Components**: `Ruleset`, `RulesetAttributes`, `NumericAttribute`, `AlphanumericAttribute`, `Weight`

**Tasks**:

- [ ] Create ruleset.module.css
- [ ] Migrate Ruleset module component
- [ ] Migrate RulesetAttributes container
- [ ] Migrate ruleset-attributes.styles.tsx
- [ ] Migrate NumericAttribute component
- [ ] Migrate AlphanumericAttribute component
- [ ] Migrate Weight component
- [ ] Handle all attribute states and variants
- [ ] **Create Storybook files** for NumericAttribute, AlphanumericAttribute, Weight
- [ ] **Verify semantic HTML** (use proper form controls, labels for attributes)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

### Ticket 14: Migrate Facets Panel (Search/Category)

**Components**: `FacetsPanel`, `facets-panel.styles.ts`, `FacetAttributesListActions`

**Tasks**:

- [ ] Create facets-panel.module.css
- [ ] Migrate FacetsPanel component
- [ ] Migrate all styled components from facets-panel.styles.ts
- [ ] Migrate FacetAttributesListActions component
- [ ] Handle row highlighting (included, excluded, algo control)
- [ ] Handle order controls (arrows, dropdowns)
- [ ] Migrate CombinedDropdown styles
- [ ] **Verify semantic HTML** (use lists, buttons for controls, proper table structure)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

### Ticket 15: Migrate Global Facets Panel

**Components**: `GlobalFacetsPanel`, `GlobalFacetPanelModal`

**Tasks**:

- [ ] Create global-facets-panel.module.css
- [ ] Migrate GlobalFacetsPanel
- [ ] Migrate GlobalFacetPanelModal
- [ ] Handle global facet specific styles
- [ ] **Verify semantic HTML** (proper list/panel structure, modal semantics)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

### Ticket 16: Migrate Facet List Module

**Components**: `FacetList`, facet rows

**Tasks**:

- [ ] Create facet-list.module.css
- [ ] Migrate FacetList component
- [ ] Migrate facet row components
- [ ] Handle facet type variants (search, category, global)
- [ ] Handle order arrows and dropdowns
- [ ] **Verify semantic HTML** (use proper list structure, button controls)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

### Ticket 17: Migrate Facet Values Edit Pages

**Components**: Global/Search/Category facet values pages, `FacetAttributesPageLayoutHeader`

**Tasks**:

- [ ] Create facet-values-page.module.css
- [ ] Migrate GlobalFacetAttributesPageLayout
- [ ] Migrate GlobalFacetAttributesList
- [ ] Migrate GlobalFacetAttribute
- [ ] Migrate GlobalEditableLabel
- [ ] Migrate GlobalArrowButtons
- [ ] Migrate FacetAttributesPageLayoutHeader styles
- [ ] Migrate category/facets/values/edit/[id]/index.page.tsx
- [ ] Migrate search/facets/values/edit/[id]/index.page.tsx
- [ ] Migrate global/facets/values/edit/[id]/index.page.tsx
- [ ] **Verify semantic HTML** (proper form structure, editable regions, labels)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

### Ticket 18: Migrate Product & Ruleset Feature Components

**Components**: `Product`, `ProductGridHeader`, `ProductSearchAll`, `AddAttribute`, `VisualEditor`, `CategorySearch`, `RulesetChanges`, `Preview`, `SearchKeywords`, `TablePanel`

**Tasks**:

- [ ] Create product.module.css
- [ ] Migrate Product styles (containers/rulesets/product)
- [ ] Migrate ProductGridHeader
- [ ] Migrate ProductSearchAll feature
- [ ] Migrate AddAttribute feature
- [ ] Migrate VisualEditor styles
- [ ] Migrate CategorySearch styles
- [ ] Migrate RulesetChanges feature
- [ ] Migrate Preview feature (shared)
- [ ] Migrate SearchKeywords feature (shared)
- [ ] Migrate TablePanel feature (shared)
- [ ] **Verify semantic HTML** (proper page structure, sections, headings)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

### Ticket 19: Migrate Pages & Utility Components

**Components**: Top-level pages, `Redirect`, `EditableLabel`, utility styles

**Tasks**:

- [ ] Migrate index.page.tsx
- [ ] Migrate error.page.tsx
- [ ] Migrate flags/index.page.tsx
- [ ] Migrate docs/styleguide/index.page.tsx
- [ ] Migrate sandbox/index.page.tsx
- [ ] Migrate \_app.page.tsx (remove Emotion global styles)
- [ ] Migrate \_document.page.tsx (remove Emotion Global)
- [ ] Migrate .storybook/preview.tsx (remove Emotion Global)
- [ ] Migrate Redirect module
- [ ] Migrate EditableLabel (shared/editable-label)
- [ ] Migrate shared.styles.tsx utility
- [ ] Migrate base-styles.ts utility
- [ ] Handle edit/view states
- [ ] Handle error states
- [ ] **Create Storybook file** for EditableLabel
- [ ] **Verify semantic HTML** (proper main/section structure, page landmarks)
- [ ] Ensure all styles actually required, no duplication, etc
- [ ] Before and after screenshots on each PR

---

## Phase 5: Cleanup & Optimization

### Ticket 20: Remove Emotion Dependencies

**Components**: N/A (cleanup)

**Tasks**:

- [ ] Search codebase for remaining Emotion imports
- [ ] Remove `@emotion/styled` from package.json
- [ ] Remove `@emotion/react` from package.json
- [ ] Remove `@emotion/jest` from package.json and jest.setup.ts
- [ ] Remove `@emotion/babel-plugin` if present
- [ ] Update babel/webpack config
- [ ] Run full test suite
- [ ] Verify no Emotion code remains

---
