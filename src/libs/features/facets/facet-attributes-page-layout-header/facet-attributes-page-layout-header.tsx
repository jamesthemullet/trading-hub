import { ErrorMessage, Text, Typography } from '@/libs/components';

import Image from 'next/image';

import {
  ButtonContainer,
  CancelButton,
  FlagAndButtons,
  FlagAndText,
  SaveButton,
  StyledText,
  Summary,
  SummaryBox,
  Wrapper,
} from './facet-attributes-page-layout-header-styles';

type HeaderProps = {
  algoControlValues: number;
  includedValues: number;
  excludedValues: number;
  displayName: string;
  facetType: 'category' | 'search' | 'global';
  isSaveDisabled: boolean;
  error?: string;
  onClose: (facetType: 'category' | 'search' | 'global') => void;
  onSave: () => void;
};

export const FacetAttributesPageLayoutHeader = ({
  algoControlValues,
  includedValues,
  excludedValues,
  displayName,
  facetType,
  isSaveDisabled,
  error,
  onClose,
  onSave,
}: HeaderProps) => {
  return (
    <Wrapper>
      <FlagAndButtons>
        <FlagAndText>
          <Image
            src="/trading-hub/asset/icon-uk-flag.svg"
            width={20}
            height={20}
            alt="UK flag"
          />
          <Text>All pages</Text>
        </FlagAndText>
        <ButtonContainer>
          <CancelButton
            theme="outlined"
            onClick={() => {
              onClose(facetType);
            }}
            type="button"
          >
            Cancel
          </CancelButton>

          <SaveButton
            theme="primary"
            isDisabled={isSaveDisabled}
            onClick={onSave}
          >
            Save
          </SaveButton>
        </ButtonContainer>
      </FlagAndButtons>
      <StyledText>Value settings of: {displayName}</StyledText>

      {error && <ErrorMessage>Error updating facet: {error}</ErrorMessage>}

      <Summary>
        <SummaryBox data-testid="include-only-count">
          <Typography variant="headlineSmall">{includedValues}</Typography>
          <Typography variant="labelMedium">Include only</Typography>
        </SummaryBox>
        <SummaryBox data-testid="algo-control-count">
          <Typography variant="headlineSmall">{algoControlValues}</Typography>
          <Typography variant="labelMedium">Algo control</Typography>
        </SummaryBox>
        <SummaryBox data-testid="exclude-only-count">
          <Typography variant="headlineSmall">{excludedValues}</Typography>
          <Typography variant="labelMedium">Exclude only</Typography>
        </SummaryBox>
      </Summary>
    </Wrapper>
  );
};
