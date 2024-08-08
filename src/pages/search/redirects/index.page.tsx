import styled from '@emotion/styled';

import { Heading, spacing } from '@/libs/components';

const PageNameLabel = styled.h2`
  margin: ${spacing(3)} ${spacing(2)};
`;

const RedirectRuleSets = () => {
  return (
    <>
      <Heading
        breadcrumbs={['Search & Merchandising', 'Site search', 'Redirects']}
      />

      <PageNameLabel>Keyword Redirect</PageNameLabel>
    </>
  );
};

export default RedirectRuleSets;
