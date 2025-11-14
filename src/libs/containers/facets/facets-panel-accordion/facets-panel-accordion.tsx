import styled from '@emotion/styled';
import { useState } from 'react';

import { Typography } from '@/libs/components';
import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

const AccordionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: ${spacing(2.5)};
`;
const ContentWrapper = styled.div`
  width: 100%;
`;
const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};
  margin-bottom: ${spacing(2)};
`;

const StyledToggleButton = styled.button`
  background: none;
  border: none;
  color: ${color.role.link.link};
  cursor: pointer;
  width: 200px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: ${spacing(1)};
`;
const StyledAnimatedSvg = styled.svg`
  user-select: none;
`;

const Summary = styled.div`
  display: flex;
  gap: ${spacing(1.5)};
`;
const SummaryBox = styled.div`
  width: 92px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing(1)};
  padding: ${spacing(1)};
  background-color: ${color.accent.tertiary.tertiaryContainer};
`;

type FacetsPanelAccordionProps = {
  boostedCount: number;
  excludedCount: number;
  nonBoostedExcludedCount: number;
};

export const FacetsPanelAccordion = ({
  boostedCount,
  excludedCount,
  nonBoostedExcludedCount,
}: FacetsPanelAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AccordionWrapper>
      <ContentWrapper>
        {isOpen && (
          <Content>
            <Typography
              data-testid="attribute-summary-label"
              variant="labelMedium"
            >
              Attribute Summary
            </Typography>
            <Summary>
              <SummaryBox data-testid="include-only-count">
                <Typography variant="headlineMedium">{boostedCount}</Typography>
                <Typography variant="labelMedium">Include only</Typography>
              </SummaryBox>
              <SummaryBox data-testid="algo-control-count">
                <Typography variant="headlineMedium">
                  {nonBoostedExcludedCount}
                </Typography>
                <Typography variant="labelMedium">Algo control</Typography>
              </SummaryBox>
              <SummaryBox data-testid="exclude-only-count">
                <Typography variant="headlineMedium">
                  {excludedCount}
                </Typography>
                <Typography variant="labelMedium">Exclude only</Typography>
              </SummaryBox>
            </Summary>
          </Content>
        )}
      </ContentWrapper>

      <StyledToggleButton onClick={() => setIsOpen((open) => !open)}>
        <StyledAnimatedSvg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={
              isOpen
                ? 'M9 6.22119L4.5 10.7212L5.5575 11.7787L9 8.34369L12.4425 11.7787L13.5 10.7212L9 6.22119Z'
                : 'M12.4425 6.22119L9 9.65619L5.5575 6.22119L4.5 7.27869L9 11.7787L13.5 7.27869L12.4425 6.22119Z'
            }
            fill={color.role.link.link}
          />
        </StyledAnimatedSvg>
        {isOpen ? 'Hide Summary' : 'View Summary'}
      </StyledToggleButton>
    </AccordionWrapper>
  );
};
