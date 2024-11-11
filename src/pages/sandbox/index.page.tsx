/* istanbul ignore file */

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import styled from '@emotion/styled';
import { ArrowButton } from '../../libs/components/buttons/button/arrow-button';
import { SearchKeywords } from '@/libs/components/keywords/search-keywords/search-keywords';
import { useState } from 'react';
import { DateTimePickerModal } from '@/libs/components/calendar/date-time-picker-modal';

const Example = styled.div`
  padding: 20px;
`;

const KeywordMock = () => {
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const onAddSearchTerm = (keyword: string) => {
    setSearchTerms([...searchTerms, keyword]);
  };
  const onRemoveSearchTerm = (keyword: string) => {
    setSearchTerms(searchTerms.filter((term) => term !== keyword));
  };
  const [previewValue, setPreviewValue] = useState<string | undefined>('');

  return (
    <SearchKeywords
      title="Search Keywords"
      searchTerms={searchTerms}
      addSearchTerm={onAddSearchTerm}
      removeSearchTerm={onRemoveSearchTerm}
      previewSearchTerm={previewValue}
      selectPreviewSearchTerm={setPreviewValue}
    />
  );
};

const KeywordMockWithValues = () => {
  const mockKeywords = [
    'womens cotton shirt',
    'womens cotton shirts',
    'cotton shirts in women',
    'cotton shirts in womens',
    'cottonshirtsinwomen',
    'women cotton shirts',
    'women cotton shirt',
    'ladies cotton shirts',
    'ladies cotton shirt',
    'cotton shirts for women',
  ];
  const [searchTerms, setSearchTerms] = useState<string[]>(mockKeywords);

  const onAddSearchTerm = (keyword: string) => {
    setSearchTerms([...searchTerms, keyword]);
  };
  const onRemoveSearchTerm = (keyword: string) => {
    setSearchTerms(searchTerms.filter((term) => term !== keyword));
  };
  const [previewValue, setPreviewValue] = useState<string | undefined>(
    mockKeywords[0]
  );

  return (
    <SearchKeywords
      title="Search Keywords"
      searchTerms={searchTerms}
      addSearchTerm={onAddSearchTerm}
      removeSearchTerm={onRemoveSearchTerm}
      previewSearchTerm={previewValue}
      selectPreviewSearchTerm={setPreviewValue}
    />
  );
};

const Sandbox = ({ nodeVersion }: { nodeVersion: string }) => {
  return (
    <div>
      <h1>Sandbox examples</h1>
      <Example>
        <h3>Running on Node version {nodeVersion}</h3>
      </Example>
      <Example>
        <h2>Calendar Component(Modal)</h2>
        <DateTimePickerModal />
      </Example>
      <Example>
        <h2>Arrow Button</h2>
        <ArrowButton direction="up"></ArrowButton>
        <ArrowButton direction="down"></ArrowButton>
        <ArrowButton isDisabled></ArrowButton>
      </Example>
      <Example>
        <h2>New arrow icons</h2>
        <img src="/trading-hub/asset/icon-boost-button.svg" alt="" />
        <img src="/trading-hub/asset/icon-bury-button.svg" alt="" />
      </Example>
      <Example>
        <h2>Search keywords Mock</h2>
        <KeywordMock />
      </Example>
      <Example>
        <h2>Search keywords Mock With Values</h2>
        <KeywordMockWithValues />
      </Example>
    </div>
  );
};

export const getServerSideProps = () => {
  return {
    props: {
      nodeVersion: process.version,
    },
  };
};

export default Sandbox;
