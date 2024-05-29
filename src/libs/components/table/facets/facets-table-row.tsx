import { format } from 'date-fns';

import { Toggle } from '../../toggle/toggle';
import type { ReturnedFacet } from '@/libs/api';
import { Text } from '../../typography/typography.styles';
import {
  TableRow,
  TableActions,
  TableDateContainer,
  TableActionsButton,
  FacetsTableCol,
  TableOptionButton,
  TableDropdown,
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
      <FacetsTableCol>
        <Text title={displayValue}>{displayValue}</Text>
      </FacetsTableCol>
      <FacetsTableCol>
        <Text title="influence">Influence</Text>
      </FacetsTableCol>
      {canToggle && (
        <FacetsTableCol>
          <Toggle
            checked={false}
            onChange={
              // istanbul ignore next
              () => {}
            }
          />
        </FacetsTableCol>
      )}
      <FacetsTableCol>
        <TableDateContainer>
          <Text>{format(new Date(lastChanged.date), 'MMM dd, yyyy')}</Text>
        </TableDateContainer>
      </FacetsTableCol>
      <FacetsTableCol>
        <Text title={lastChanged.user}>{lastChanged.user}</Text>
      </FacetsTableCol>
      <FacetsTableCol style={{ padding: '12px 0 16px' }}>
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
      </FacetsTableCol>
    </TableRow>
  );
};
