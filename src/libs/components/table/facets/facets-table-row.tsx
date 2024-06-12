import { format } from 'date-fns';

import { Toggle } from '../../toggle/toggle';
import type { ReturnedCategoryRuleSet, ReturnedFacet } from '@/libs/api';
import { Text } from '../../typography/typography.styles';
import {
  TableActions,
  TableDateContainer,
  TableActionsButton,
  TableOptionButton,
  TableDropdown,
  TableCol,
  FacetsTableRow as TableRow,
} from '../table.styles';
import { useState } from 'react';

type Props = {
  facet?: ReturnedFacet;
  ruleSet?: ReturnedCategoryRuleSet;
  onToggle?: () => void;
  editUrl: string;
  onDeleteFacet?: (id: string) => void;
};

export const FacetsTableRow = ({
  facet,
  ruleSet,
  onToggle,
  editUrl,
  onDeleteFacet,
}: Props) => {
  const [isOptionDropdownOpen, setIsOptionDropdownOpen] = useState(false);

  // TODO: this needs to be refactored
  if (facet) {
    const { displayValue, id, lastChanged } = facet;
    return (
      <TableRow key={`rule-${id}`}>
        <TableCol>
          <Text title={displayValue}>{displayValue}</Text>
        </TableCol>
        <TableCol>
          <TableDateContainer>
            <Text>{format(new Date(lastChanged.date), 'MMM dd, yyyy')}</Text>
          </TableDateContainer>
        </TableCol>
        <TableCol>
          <Text title={lastChanged.user}>{lastChanged.user}</Text>
        </TableCol>
        <TableCol style={{ padding: '12px 0 16px' }}>
          <TableActions>
            <TableActionsButton href={`${editUrl}/${id}`}>
              Edit
            </TableActionsButton>

            {onDeleteFacet && (
              <>
                <TableOptionButton
                  isOpen={isOptionDropdownOpen}
                  title="More options"
                  onClick={() => setIsOptionDropdownOpen((val) => !val)}
                />
                {isOptionDropdownOpen && (
                  <TableDropdown
                    title="Delete"
                    onClick={() => {
                      onDeleteFacet(id);
                      setIsOptionDropdownOpen(false);
                    }}
                  >
                    Delete
                  </TableDropdown>
                )}
              </>
            )}
          </TableActions>
        </TableCol>
      </TableRow>
    );
  }

  if (ruleSet) {
    const { id, categoryId, categoryName, isEnabled, lastChanged } = ruleSet;
    return (
      <TableRow key={`rule-${id}`}>
        <TableCol>
          <Text>
            {categoryId} | {categoryName}
          </Text>
        </TableCol>
        {onToggle && (
          <TableCol>
            <Toggle checked={isEnabled} onChange={() => onToggle()} />
          </TableCol>
        )}
        <TableCol>
          <TableDateContainer>
            <Text>{format(new Date(lastChanged.date), 'MMM dd, yyyy')}</Text>
          </TableDateContainer>
        </TableCol>
        <TableCol>
          <Text title={lastChanged.user}>{lastChanged.user}</Text>
        </TableCol>
        <TableCol style={{ padding: '12px 0 16px' }}>
          <TableActions>
            <TableActionsButton href={`${editUrl}`}>Edit</TableActionsButton>

            {onDeleteFacet && (
              <>
                <TableOptionButton
                  isOpen={isOptionDropdownOpen}
                  title="More options"
                  onClick={() => setIsOptionDropdownOpen((val) => !val)}
                />
                {isOptionDropdownOpen && (
                  <TableDropdown
                    title="Delete"
                    onClick={() => {
                      onDeleteFacet(id);
                      setIsOptionDropdownOpen(false);
                    }}
                  >
                    Delete
                  </TableDropdown>
                )}
              </>
            )}
          </TableActions>
        </TableCol>
      </TableRow>
    );
  }
  // ignoring as we will refactor this component
  /* istanbul ignore next */
  return null;
};
