import styled from '@emotion/styled';

import { spacing } from '../utils/spacing';

const CHECKBOX_SIZE = '18px';

export const Input = styled.input`
  appearance: none;
  background-color: #fff;
  margin: 0;
  font: inherit;
  cursor: pointer;
  width: ${CHECKBOX_SIZE};
  height: ${CHECKBOX_SIZE};
  margin-right: ${spacing(1)};

  &::before {
    content: '';
    width: ${CHECKBOX_SIZE};
    height: ${CHECKBOX_SIZE};
    border: 0.15em solid currentColor;
    margin: -2px 0 0;
    display: block;
    border-radius: 2px;
  }
  &:checked {
    &::before {
      border-color: transparent;
      background: url('/trading-hub/asset/icon-checkbox.svg') -5px -5px;
      background-size: 1.5em 1.5em;
    }
  }

  &:disabled {
    cursor: default;
    pointer-events: none;

    &::before {
      background-image: none;
      border-color: #bdbdbd;
      background-color: #bdbdbd;
    }

    &::after {
      content: '';
      width: 12px;
      height: 2px;
      background-color: #fff;
      position: absolute;
      top: 10px;
      left: 3px;
    }
  }
`;

export const Label = styled.label`
  display: flex;
  align-items: center;
`;

export const LabelText = styled.span`
  font-size: 14px;
  line-height: 14px;
`;
