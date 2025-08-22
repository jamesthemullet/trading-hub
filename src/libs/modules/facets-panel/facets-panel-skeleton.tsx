import { Skeleton } from '@mantine/core';

import { TableHeading } from '@/libs/components/table/table.styles';

import { COLUMNS } from './facets-panel';
import {
  ActionContainer,
  Actions,
  AttributesTable,
  Col,
  LowerHeading,
  Row,
  SectionWrapper,
} from './facets-panel.styles';

export const FacetsPanelSkeleton = ({ title }: { title: string }) => {
  return (
    <>
      <ActionContainer>
        <h1>{title}</h1>
        <Actions>
          <Skeleton miw={150} />
          <Skeleton miw={150} />
          <Skeleton miw={150} />
        </Actions>
      </ActionContainer>
      <SectionWrapper>
        <LowerHeading isStrong>Rule scope</LowerHeading>
        <Skeleton height={96} width="100%" />
      </SectionWrapper>
      <SectionWrapper>
        <Skeleton height={41} />
      </SectionWrapper>
      <AttributesTable>
        <Row>
          {COLUMNS.map(({ label }) => (
            <Col key={`column-${label}`}>
              <TableHeading as="p" isStrong={true}>
                {label}
              </TableHeading>
            </Col>
          ))}
        </Row>
        {Array.from({ length: 5 }).map((_, index) => {
          return (
            <Row key={index}>
              {COLUMNS.map(({ label }) => (
                <Col key={`column-${label}`}>
                  <Skeleton miw={150} mih={43} />
                </Col>
              ))}
            </Row>
          );
        })}
      </AttributesTable>
    </>
  );
};
