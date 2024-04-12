import { format } from 'date-fns';

import { Toggle } from '../../toggle/toggle';
import type { ReturnedFacet } from '@/libs/api';
import { Text } from '../../typography/typography.styles';
import {
  TableContainer,
  TableRow,
  TableCol,
  TableActions,
  TableDateContainer,
  TableHeading,
  TableActionsButton,
} from '../table.styles';

type Props = {
  facets: ReturnedFacet[];
};

const COLUMNS: {
  label: string;
}[] = [
  {
    label: 'Identifier',
  },
  {
    label: 'Influence',
  },
  {
    label: 'Enable',
  },
  {
    label: 'Last changed',
  },
  {
    label: 'user',
  },
  {
    label: 'Actions',
  },
];

export const Facets = ({ facets }: Props) => {
  return (
    <TableContainer>
      <TableRow style={{ color: '#8a8a8a', fontSize: '0.9em' }}>
        {COLUMNS.map(({ label }) => (
          <TableCol
            key={`column-${label}`}
            style={{
              userSelect: 'none',
            }}
          >
            <TableHeading as="p" isStrong={true}>
              {label}
            </TableHeading>
          </TableCol>
        ))}
      </TableRow>
      {facets.map(({ displayValue, id, lastChanged }) => {
        return (
          <TableRow key={`rule-${id}`}>
            <TableCol>
              <Text title={displayValue}>{displayValue}</Text>
            </TableCol>
            <TableCol>
              <Text title="influence">Influence</Text>
            </TableCol>
            <TableCol>
              <Toggle
                checked={false}
                onChange={
                  // istanbul ignore next
                  () => {}
                }
              />
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
