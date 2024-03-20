import styled from '@emotion/styled';

const ToggleWrapper = styled.div`
  position: relative;
`;

// styles nabbed from https://uiverse.io/lenin55/fast-chicken-43
const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  cursor: pointer;

  & > input {
    appearance: none;
    z-index: -1;
    position: absolute;
    right: 6px;
    top: -8px;
    display: block;
    margin: 0;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    background-color: rgba(0 0 0 / 38%);
    outline: none;
    opacity: 0;
    transform: scale(1);
    pointer-events: none;
    transition:
      opacity 0.3s 0.1s,
      transform 0.2s 0.1s;
  }

  & > span::before {
    content: '';
    display: inline-block;
    margin: 5px 0 5px 10px;
    border-radius: 7px;
    width: 36px;
    height: 14px;
    background-color: rgba(0 0 0 / 38%);
    vertical-align: top;
    transition:
      background-color 0.2s,
      opacity 0.2s;
  }

  & > span::after {
    content: '';
    position: absolute;
    top: 2px;
    right: 16px;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    background-color: #fff;

    /* eslint-disable-next-line scale-unlimited/declaration-strict */
    box-shadow:
      0 3px 1px -2px rgba(0 0 0 / 20%),
      0 2px 2px 0 rgba(0 0 0 / 14%),
      0 1px 5px 0 rgba(0 0 0 / 12%);
    transition:
      background-color 0.2s,
      transform 0.2s;
  }

  & > input:checked {
    right: -10px;
    background-color: #b2ccc6;
  }

  & > input:checked + span::before {
    background-color: #b2ccc6;
  }

  & > input:checked + span::after {
    background-color: #005640;
    transform: translateX(16px);
  }
  &:hover > input {
    opacity: 0.04;
  }

  & > input:focus {
    opacity: 0.12;
  }

  &:hover > input:focus {
    opacity: 0.16;
  }
  & > input:active {
    opacity: 1;
    transform: scale(0);
    transition:
      transform 0s,
      opacity 0s;
  }

  & > input:active + span::before {
    background-color: #8f8f8f;
  }

  & > input:checked:active + span::before {
    background-color: #b2ccc6;
  }
  & > input:disabled {
    opacity: 0;
  }

  & > input:disabled + span::before {
    background-color: #ddd;
  }

  & > input:checked:disabled + span::before {
    background-color: #bfdbda;
  }

  & > input:checked:disabled + span::after {
    background-color: #61b5b4;
  }
`;

const ToggleInput = styled.input``;

type Props = {
  isEnabled: boolean;
  onClick: () => void;
};

export const Toggle = ({ isEnabled, onClick }: Props) => {
  return (
    <ToggleWrapper>
      <ToggleSwitch title="Toggle">
        <ToggleInput
          type="checkbox"
          checked={isEnabled}
          onClick={() => onClick()}
        />
        <span></span>
      </ToggleSwitch>
    </ToggleWrapper>
  );
};
