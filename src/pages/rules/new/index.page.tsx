import { useState } from 'react';

import styled from '@emotion/styled';
import type { Category } from '@/libs/api';
import { useRouter } from 'next/router';
import {
  Button,
  CategorySearch,
  Heading,
  PageWrapper,
  spacing,
} from '@/libs/components';
import { colourDictionary } from '@/libs/components/utils/constants';
import { useRuleSetCreate } from '@/libs/hooks';
import { Typography } from '@/libs/components/typography/typography';

const Wrapper = styled.div`
  padding: ${spacing(3)} 0;
`;

const PageTitle = styled.div`
  padding: 0 ${spacing(2)} 0 ${spacing(3)};
  display: flex;

  h1 {
    font-size: 1.5em;
  }
`;

const PageButtons = styled.div`
  display: flex;
  gap: ${spacing(2)};
  margin-left: auto;
  padding-left: 18px;
`;

const ErrorText = styled.p`
  color: ${colourDictionary.red[300]};
  margin: ${spacing(1)} 0;
`;

const NewRuleSetPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const { handlePost, error } = useRuleSetCreate();
  const router = useRouter();

  const onCreateNewCategory = async () => {
    if (!selectedCategory?.identifier) {
      return;
    }

    const resp = await handlePost({
      categoryId: selectedCategory.identifier,
    });

    if (resp) {
      return router.push(`/rules/edit/${resp.id}`);
    }
  };

  const onSelectCategory = (category: Category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      <Heading
        breadcrumbs={['Search & Merchandising', 'Categories', 'Ranking rules']}
      />

      <Wrapper>
        <PageTitle>
          <Typography as="h1">Category Rule Editor</Typography>
          <PageButtons>
            <Button as="a" href="/rules">
              Cancel
            </Button>
          </PageButtons>
        </PageTitle>

        <PageWrapper>
          <Typography
            as="p"
            isStrong={true}
            style={{ marginBottom: spacing(2) }}
          >
            Choose a category or sub-category
          </Typography>

          <CategorySearch
            selectedCategory={selectedCategory}
            onClearSelection={() => {
              setSelectedCategory(undefined);
            }}
            onSelectCategory={onSelectCategory}
          />

          <div style={{ display: 'flex' }}>
            <Button
              style={{
                flex: '0 0 200px',
                height: '40px',
                marginLeft: 'auto',
              }}
              theme="primary"
              onClick={onCreateNewCategory}
              aria-disabled={!selectedCategory}
            >
              Create
            </Button>
          </div>

          {error && <ErrorText>Error: {error}</ErrorText>}
        </PageWrapper>
      </Wrapper>
    </>
  );
};

export default NewRuleSetPage;
