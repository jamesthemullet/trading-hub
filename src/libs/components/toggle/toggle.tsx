import styled from '@emotion/styled';
import { DetailedHTMLProps, InputHTMLAttributes } from 'react';

import { color } from '../utils/constants';

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  cursor: pointer;
  user-select: none;

  & > input {
    appearance: none;
    z-index: -1;
    position: absolute;
  }

  & > span::before {
    content: '';
    display: inline-block;
    border-radius: 16px;
    width: 52px;
    height: 32px;
    background-color: #e6e0e9;
    border: 2px solid #79747e;
    vertical-align: top;
    transition:
      background-color 0.2s,
      opacity 0.2s;
  }

  & > span::after {
    content: '';
    position: absolute;
    top: 4px;
    right: 24px;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    background-image: url('/trading-hub/asset/icon-toggle-disabled.svg');
    background-repeat: no-repeat;
    background-size: contain;
    transition:
      background-color 0.2s,
      transform 0.2s;
  }

  & > input:not([disabled]):checked + span::before {
    background-color: ${color.darkHeritageGreen};
    border: 2px solid ${color.darkHeritageGreen};
    transition:
      background-color 0.2s,
      opacity 0.2s;
  }

  & > input:checked + span::after {
    background-image: url('/trading-hub/asset/icon-toggle-enabled.svg');
    background-repeat: no-repeat;
    background-size: contain;
    transform: translateX(20px);
  }

  & > input:focus + span::before {
    outline: solid;
  }
`;

export const Toggle = (
  props: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) => {
  return (
    <ToggleSwitch title="Toggle">
      <input type="checkbox" {...props} />
      <span></span>
    </ToggleSwitch>
  );
};
