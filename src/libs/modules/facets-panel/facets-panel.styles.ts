import styled from '@emotion/styled';

import { Dropdown, spacing, Text } from '@/libs/components';
import { TableCol, TableRow } from '@/libs/components/table/table.styles';
import { color } from '@/libs/components/utils/constants';

export const ActionContainer = styled.div`
  display: flex;

  h1 {
    font-size: 1.5em;
    padding: ${spacing(3)} ${spacing(2)};
  }

  a,
  button {
    min-width: 150px;
    text-align: center;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: ${spacing(2)};
  margin-left: auto;
  padding: 18px;
`;

export const AddFacetPanel = styled.div`
  display: flex;
  justify-content: space-between;

  div {
    &:first-of-type {
      flex: 6;
    }

    &:last-of-type {
      flex: 1;
    }
  }
`;

export const LowerHeading = styled(Text)`
  font-size: 1em;
  margin-bottom: 1em;
`;

export const ScopeWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};

  & > div:second-child {
    width: 100%;
  }
`;

export const Duration = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};

  label {
    margin-top: ${spacing(0.5)};
  }
`;

export const AttributesTable = styled.div`
  display: flex;
  flex-direction: column;
  margin: ${spacing(2)};
`;

export const SectionWrapper = styled.div`
  box-shadow: #000 0 0 10px -5px;
  margin: ${spacing(2)};
  margin-bottom: 0;
  border-radius: 4px;
  padding: ${spacing(2)};
`;

export const OrderColumn = styled.div`
  display: flex;
  gap: ${spacing(1)};
  padding-right: ${spacing(1)};
`;

type TableRowProps = {
  optionSelected?: string;
};

export const Row = styled(TableRow)<TableRowProps>`
  font-size: 1rem;
  align-items: center;
  border-bottom: none;
  box-shadow: #000 0 0 10px -5px;
  margin-bottom: ${spacing(2)};
  padding: ${spacing(2)};

  ${({ optionSelected }) =>
    optionSelected === 'included' &&
    `background-color: ${color.successGreenBackground}`}

  ${({ optionSelected }) =>
    optionSelected === 'excluded' &&
    `background-color: ${color.errorRedBackground}`}

  ${({ optionSelected }) =>
    optionSelected === 'algoControl' &&
    `background-color: ${color.backgroundDarkGrey}`}
`;

export const Col = styled(TableCol)`
  justify-content: space-between;
`;

export const NoAttributesBlock = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  margin-top: 100px;

  p {
    font-size: 1.25rem;
    color: #707070;
  }
`;

export const OrderArrowsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: ${spacing(12)};
  margin-right: ${spacing(2)};
  gap: ${spacing(1)};
`;

export const CountrySelectorLabel = styled(Text)`
  margin-bottom: ${spacing(1)};
  line-height: 1.6rem;
`;

export const CountryPreviewDropdown = styled(Dropdown)`
  width: 155px;
  height: 54px;

  img {
    margin-left: -${spacing(2)};
    margin-right: ${spacing(1)};
  }

  span {
    padding-left: 0;
  }
`;
