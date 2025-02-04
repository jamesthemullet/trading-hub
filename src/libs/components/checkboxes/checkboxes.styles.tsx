import styled from '@emotion/styled';

import { spacing } from '../utils/spacing';

export const Input = styled.input`
  appearance: none;
  background-color: #fff;
  margin: 0;
  font: inherit;
  cursor: pointer;
  width: 1.15em;
  height: 1.15em;
  margin-right: ${spacing(1)};

  &::after {
    content: '';
    width: 1.15em;
    height: 1.15em;
    border: 0.15em solid currentColor;
    margin: -2px 0 0;
    display: block;
    border-radius: 2px;
  }
  &:checked {
    &::after {
      border-color: transparent;
      background: url('/trading-hub/asset/icon-checkbox.svg') -5px -5px;
      background-size: 1.5em 1.5em;
    }
  }

  &:disabled {
    cursor: default;
    pointer-events: none;

    &::after {
      background-image: none;
      border-color: #bdbdbd;
      background-color: #bdbdbd;
    }
  }
`;

export const Label = styled.label`
  display: flex;
  align-items: center;
`;

export const LabelText = styled.span`
  font-size: 12px;
`;
