import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import type { MerchandisingAttributeValuesResponse } from '@/libs/api';

import { CategoryAndSearchFacetsPanelPageLayout } from './category-and-search-facet-attributes-page-layout';

const ruleSetId = '090152b8-2517-4e42-a5f3-48fcab8d9942';

const attributeValuesMock: MerchandisingAttributeValuesResponse['values'] = [
  {
    displayValue: '13 - 14.4',
  },
  {
    displayValue: '10 - 12.9',
  },
  {
    displayValue: '14.5 - 20',
  },
  {
    displayValue: 'Under 10',
  },
  {
    displayValue: 'Over 20',
  },
];

import { mockRuleData } from '@/test/data/mock-use-rule-set-preview.data';

const defaultProps = {
  attributeValues: attributeValuesMock,
  ruleSetDetail: mockRuleData,
  facetId: 'facet-123',
  displayName: 'Color',
  facets: mockRuleData.facets || [],
  facetType: 'category' as const,
  ruleSetId,
};

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
};

describe('Category And Search Facets Panel Page Layout', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should render page', () => {
    render(<CategoryAndSearchFacetsPanelPageLayout {...defaultProps} />);

    expect(
      screen.getByText('hello category/search values...')
    ).toBeInTheDocument();
  });

  it('should close and go back to category/search facets page', async () => {
    const user = userEvent.setup();
    render(<CategoryAndSearchFacetsPanelPageLayout {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockRouter.push).toHaveBeenCalledWith(
      `/category/facets/edit/${ruleSetId}`
    );
  });

  it('should save when save button is clicked', async () => {
    const user = userEvent.setup();
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<CategoryAndSearchFacetsPanelPageLayout {...defaultProps} />);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('save');
  });
});
