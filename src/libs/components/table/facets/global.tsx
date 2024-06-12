import type { ReturnedFacet } from '@/libs/api';
import {
  TableContainer,
  TableHeading,
  TableCol,
  FacetsTableRow as TableRow,
} from '../table.styles';
import { FacetsTableRow } from './facets-table-row';

type Props = {
  facets: ReturnedFacet[] & { isEnabled?: boolean };
  editUrl: string;
};

export const GlobalFacetsManagementTable = ({ facets, editUrl }: Props) => {
  const columns: {
    label: string;
  }[] = [
    {
      label: 'Identifier',
    },
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

      {facets.map((facet) => (
        <FacetsTableRow key={facet.id} facet={facet} editUrl={editUrl} />
      ))}
    </TableContainer>
  );
};
