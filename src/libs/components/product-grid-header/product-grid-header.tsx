import styled from '@emotion/styled';
import { spacing } from '../utils/spacing';
import { Button } from '../button/button';

const RuleSetOptions = styled.div`
  display: flex;

  h1 {
    font-size: 1.5em;
    padding: ${spacing(3)} ${spacing(2)};
  }

  a,
  button {
    min-width: 110px;
    text-align: center;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${spacing(2)};
  margin-left: auto;
  padding: 18px;
`;

export const ProductGridHeader = ({ onSave }: { onSave: () => void }) => (
  <RuleSetOptions>
    <h1>Product Grid</h1>

    <Actions>
      <Button as="a" href="/rules">
        Cancel
      </Button>
      {/* placeholder for preview */}
      <Button as="a" href="">
        Preview
      </Button>
      <Button theme="primary" onClick={onSave}>
        Save
      </Button>
    </Actions>
  </RuleSetOptions>
);
