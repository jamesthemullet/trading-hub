import { format } from 'date-fns';

import { Toggle } from '../../toggle/toggle';
import type { ReturnedFacet } from '@/libs/api';
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
  facet: ReturnedFacet;
  canToggle: boolean;
  editUrl: string;
  canDelete?: boolean;
  onDeleteFacet?: (id: string) => void;
};

export const FacetsTableRow = ({
  facet,
  canToggle,
  editUrl,
  canDelete,
  onDeleteFacet,
}: Props) => {
  const [isOptionDropdownOpen, setIsOptionDropdownOpen] = useState(false);

  const { displayValue, id, lastChanged } = facet;
  return (
    <TableRow key={`rule-${id}`}>
      <TableCol>
        <Text title={displayValue}>{displayValue}</Text>
      </TableCol>
      <TableCol>
        <Text title="influence">Influence</Text>
      </TableCol>
      {canToggle && (
        <TableCol>
          <Toggle
            checked={false}
            onChange={
              // istanbul ignore next
              () => {}
            }
          />
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
          <TableActionsButton href={`${editUrl}/${id}`}>
            Edit
          </TableActionsButton>

          {canDelete && (
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
                    onDeleteFacet?.(id);
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
};
