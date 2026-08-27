import type { ReactElement } from 'react';

import {
  Button,
  CombinedDropdown,
  DropdownVariant,
  Typography,
} from '@/libs/components';

import styles from './preview.module.css';

const VIEW_MODES = ['newRuleChange', 'currentState', 'sideBySide'];

export type ViewMode = (typeof VIEW_MODES)[number];

const VIEW_MODE_LABEL: Record<ViewMode, string> = {
  newRuleChange: 'with new rule change',
  currentState: 'current state',
  sideBySide: 'side by side',
};

type Props = {
  viewMode: ViewMode;
  onChange: (viewMode: ViewMode) => void;
};

export const ViewModeSelector = ({
  viewMode,
  onChange,
}: Props): ReactElement => (
  <div className={styles.previewTypeSelector}>
    <Typography variant="bodySmall">Preview</Typography>
    <CombinedDropdown
      variant={DropdownVariant.Generic}
      width={220}
      label={VIEW_MODE_LABEL[viewMode]}
      ariaLabel="Preview type selector"
    >
      {VIEW_MODES.map((mode) => (
        <Button
          className={styles.item}
          type="button"
          onClick={() => onChange(mode)}
          role="menuitemradio"
          aria-checked={viewMode === mode}
          key={mode}
        >
          <Typography variant="bodySmall" align="center">
            {VIEW_MODE_LABEL[mode]}
          </Typography>
        </Button>
      ))}
    </CombinedDropdown>
  </div>
);
