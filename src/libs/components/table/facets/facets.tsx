import type { ReturnedFacet } from '@/libs/api';
import {
  TableContainer,
  TableRow,
  TableHeading,
  FacetsTableCol,
} from '../table.styles';
import { FacetsTableRow } from './facets-table-row';

type Props = {
  facets: ReturnedFacet[];
  canToggle?: boolean;
  editUrl: string;
  canDelete?: boolean;
  onDeleteFacet?: (id: string) => void;
};

export const FacetsManagementTable = ({
  facets,
  editUrl,
  onDeleteFacet,
  canToggle = false,
  canDelete = false,
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
      {facets.map((facet) => (
        <FacetsTableRow
          key={facet.id}
          facet={facet}
          canToggle={canToggle}
          editUrl={editUrl}
          canDelete={canDelete}
          onDeleteFacet={onDeleteFacet}
        />
      ))}
    </TableContainer>
  );
};
