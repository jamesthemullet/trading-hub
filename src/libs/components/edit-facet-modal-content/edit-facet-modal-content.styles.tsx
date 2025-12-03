import styled from '@emotion/styled';
import { Skeleton } from '@mantine/core';

import { ModalStickyHeader } from '@/libs/components/modals/modal.styles';
import { TableCol } from '@/libs/containers/shared/table/table.styles';
import { spacing } from '@/libs/utils/spacing';

export const Col = styled(TableCol)`
  padding: 0;
`;

export const FlexColumnCol = styled(Col)`
  display: flex;
  flex-direction: column;
`;

export const AttributesModalHeader = styled(ModalStickyHeader)`
  padding: ${spacing(3)};
  padding-bottom: 0;
`;

export const BodyContainer = styled.div`
  margin: 0 ${spacing(3)};
`;

export const MergeAndSearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${spacing(2)};
  padding: ${spacing(2)} 0;
  p {
    flex: 80;
  }
  button {
    flex: 20;
  }
  div {
    flex: 40;
  }
`;

export const SkeletonRow = styled(Skeleton)`
  width: 100%;
  height: 75px;
  margin-bottom: ${spacing(1)};
`;

export const OrderArrowsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: ${spacing(12)};
  margin-right: ${spacing(2)};
`;

export const AttributeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing(2)};
`;

export const MergedValue = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing(1)};
`;
export const GlobalFacetAttributesPageMergedValue = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing(1)};
  margin-left: ${spacing(4)};
`;

export const RemoveMergedFacet = styled.button`
  background: url('/trading-hub/asset/icon-close-black.svg');
  width: 18px;
  height: 18px;
  display: inline-block;
  border: none;
`;

export const HandleCol = styled(Col)`
  display: flex;
  justify-content: flex-end;
`;

export const DragHandleButton = styled.button`
  width: 48px;
  height: 48px;
  padding: 12px;
  margin: 0;
  border: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;
