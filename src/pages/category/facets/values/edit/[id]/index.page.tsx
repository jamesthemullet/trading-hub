import styled from '@emotion/styled';

import { Heading } from '@/libs/components';
import { useShowNewFacetValuesPage } from '@/libs/components/feature-flag/feature-flag';

import Head from 'next/head';

const CentredContainer = styled.div`
  margin-top: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Page = ({ id }: { id: string }) => {
  console.log(id);

  const showNewFacetValuesPage = useShowNewFacetValuesPage();

  return (
    <>
      <Head>
        <title>
          Merchandising Hub | M&S | Edit Category Ruleset Facet Values
        </title>
      </Head>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'Editor']} />
      {showNewFacetValuesPage ? (
        <CentredContainer>New Facet Values Page Enabled</CentredContainer>
      ) : (
        <CentredContainer>Coming soon</CentredContainer>
      )}
    </>
  );
};

export default Page;
