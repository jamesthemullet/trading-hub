import { format } from 'date-fns';

import { Toggle } from '../../toggle/toggle';
import type { ReturnedFacet } from '@/libs/api';
import { Text } from '../../typography/typography.styles';
import {
  TableContainer,
  TableRow,
  TableCol,
  TableColumnOrder,
  TableActions,
  TableDateContainer,
  TableHeading,
  TableActionsButton,
} from '../table.styles';

type Props = {
  columnOrderName: keyof ReturnedFacet;
  columnSortOrder: 'asc' | 'desc';
  onColumnOrderChange: (columnId: keyof ReturnedFacet) => void;
  facets: (ReturnedFacet & { isEnabled: boolean })[];
};

const COLUMNS: {
  label: string;
  sortBy?: keyof ReturnedFacet;
}[] = [
  {
    label: 'Identifier',
    sortBy: 'displayValue',
  },
  {
    label: 'Influence',
  },
  {
    label: 'Enable',
  },
  {
    label: 'Last changed',
    sortBy: 'lastChanged',
  },
  {
    label: 'user',
  },
  {
    label: 'Actions',
  },
];

export const Facets = ({
  facets,
  onColumnOrderChange,
  columnOrderName,
  columnSortOrder,
}: Props) => {
  return (
    <TableContainer>
      <TableRow style={{ color: '#8a8a8a', fontSize: '0.9em' }}>
        {COLUMNS.map(({ label, sortBy }) => (
          <TableCol
            key={`column-${label}`}
            style={{
              cursor: sortBy ? 'pointer' : 'auto',
              userSelect: 'none',
            }}
            onClick={() => {
              sortBy && onColumnOrderChange(sortBy);
            }}
          >
            <TableHeading as="p" isStrong={true}>
              {label}
            </TableHeading>

            {sortBy && (
              <TableColumnOrder
                aria-label={`column-${sortBy}-order-${columnOrderName === sortBy ? columnSortOrder : 'unsorted'}`}
                order={
                  columnOrderName === sortBy ? columnSortOrder : 'unsorted'
                }
              />
            )}
          </TableCol>
        ))}
      </TableRow>
      {facets.map(({ displayValue, id, lastChanged, isEnabled }) => {
        return (
          <TableRow key={`rule-${id}`}>
            <TableCol>
              <Text title={displayValue}>{displayValue}</Text>
            </TableCol>
            <TableCol>
              <Text title="influence">Influence</Text>
            </TableCol>
            <TableCol>
              <Toggle checked={isEnabled} onChange={() => {}} />
            </TableCol>
            <TableCol>
              <TableDateContainer>
                <Text>
                  {format(new Date(lastChanged.date), 'MMM dd, yyyy')}
                </Text>
              </TableDateContainer>
            </TableCol>
            <TableCol>
              <Text title={lastChanged.user}>{lastChanged.user}</Text>
            </TableCol>
            <TableCol style={{ padding: '12px 0 16px' }}>
              <TableActions>
                <TableActionsButton href={`../../../facet-management/${id}`}>
                  Edit
                </TableActionsButton>
              </TableActions>
            </TableCol>
          </TableRow>
        );
      })}
    </TableContainer>
  );
};
