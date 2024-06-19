import { Skeleton } from '@mantine/core';

import { Text } from '@/libs/components';
import { TableHeading } from '@/libs/components/table/table.styles';

import {
  ActionContainer,
  Actions,
  AddFacetPanel,
  AttributesTable,
  Col,
  COLUMNS,
  LowerHeading,
  Row,
  SectionWrapper,
} from './facets-panel';

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
        <Skeleton height={96} width={'100%'} />
      </SectionWrapper>
      <SectionWrapper>
        <AddFacetPanel>
          <div>
            <LowerHeading isStrong>Preview and manage facets</LowerHeading>
            <Text>(sort by algo control)</Text>
          </div>
          <div>
            <Skeleton miw={133} height={43} />
          </div>
        </AddFacetPanel>
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
