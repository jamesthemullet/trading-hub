import { Skeleton } from '@mantine/core';

import { FirstColumn, Row } from './datatable';
import { TableCol, TableContainer, TableHeading } from './table.styles';

export const DataTableSkeleton = ({
  headings,
  rowsCount,
}: {
  headings: string[];
  rowsCount: number;
}) => {
  return (
    <>
      <TableContainer aria-label="datatable-skeleton">
        <Row style={{ color: '#8a8a8a', fontSize: '0.9em' }}>
          {headings.map((heading) => (
            <TableCol key={heading}>
              <TableHeading as="p" isStrong={true}>
                {heading}
              </TableHeading>
            </TableCol>
          ))}
        </Row>

        {Array.from({ length: rowsCount }).map((_, index) => {
          return (
            <Row key={`skeleton-row-${index}`}>
              <FirstColumn>
                <Skeleton height={48} width={'100%'} />
              </FirstColumn>
              <TableCol>
                <Skeleton height={48} width={'100%'} />
              </TableCol>
              <TableCol>
                <Skeleton height={48} width={'100%'} />
              </TableCol>
              <TableCol>
                <Skeleton height={48} width={'100%'} />
              </TableCol>
              <TableCol style={{ padding: '12px 0 16px' }}>
                <Skeleton height={48} width={113.3} />
              </TableCol>
            </Row>
          );
        })}
      </TableContainer>
    </>
  );
};
