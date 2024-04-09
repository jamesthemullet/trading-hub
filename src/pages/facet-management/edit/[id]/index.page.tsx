import { Button, Heading, spacing } from '@/libs/components';

import styled from '@emotion/styled';
import router from 'next/router';

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

const Page = () => {
  const handleSave = () => {
    console.log('save');
  };

  const onPreview = () => {
    console.log('preview');
  };

  const hasPreview = false;

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'Editor']} />

      <RuleSetOptions>
        <h1>Facet Management</h1>

        <Actions>
          <Button onClick={() => router.push('/facet-management')}>
            Cancel
          </Button>
          <Button onClick={onPreview} isDisabled={!hasPreview}>
            Preview
          </Button>
          <Button theme="primary" isDisabled={!hasPreview} onClick={handleSave}>
            Save
          </Button>
        </Actions>
      </RuleSetOptions>
    </>
  );
};

export default Page;
