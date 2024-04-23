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
import styled from '@emotion/styled';
import { spacing } from '../../utils/spacing';

type Props = {
  facets: ReturnedFacet[];
  canToggle?: boolean;
  editUrl: string;
};

const FacetsTableCol = styled(TableCol)`
  flex: 0 0 150px;

  &:first-of-type {
    flex: 2 0 240px;
    padding-left: ${spacing(2)};
  }

  &:nth-of-type(2) {
    flex: 0 0 100px;
  }

  &:nth-of-type(5) {
    flex: 0 0 180px;
  }
`;

export const FacetsManagementTable = ({
  facets,
  canToggle = false,
  editUrl,
}: Props) => {
  const columns: {
    label: string;
  }[] = [
    {
      label: 'Identifier',
    },
    {
      label: 'Influence',
    },
    ...(() =>
      canToggle
        ? [
            {
              label: 'Enable',
            },
          ]
        : [])(),
    {
      label: 'Last changed',
    },
    {
      label: 'User',
    },
    {
      label: 'Actions',
    },
  ];

  return (
    <TableContainer>
      <TableRow style={{ color: '#8a8a8a', fontSize: '0.9em' }}>
        {columns.map(({ label }) => (
          <FacetsTableCol
            key={`column-${label}`}
            style={{
              userSelect: 'none',
            }}
          >
            <TableHeading as="p" isStrong={true}>
              {label}
            </TableHeading>
          </FacetsTableCol>
        ))}
      </TableRow>
      {facets.map(({ displayValue, id, lastChanged }) => {
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
                <Text>
                  {format(new Date(lastChanged.date), 'MMM dd, yyyy')}
                </Text>
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
              </TableActions>
            </FacetsTableCol>
          </TableRow>
        );
      })}
    </TableContainer>
  );
};
