import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import type { MerchandisingAttributeValuesResponse } from '@/libs/api';
import { facetsListMock } from '@/pages/api/search/mocks';

import { GlobalFacetAttributesPageLayout } from './global-facet-attributes-page-layout';

const ruleSetId = '090152b8-2517-4e42-a5f3-48fcab8d9942';
import { mockGlobalRuleData } from '@/test/data/mock-use-rule-set-preview.data';

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

const defaultProps = {
  attributeValues: attributeValuesMock,
  ruleSetDetail: mockGlobalRuleData,
  facetId: 'global-facet-123',
  displayName: 'Color',
  facets: facetsListMock.facets,
  facetType: 'category' as const,
  ruleSetId,
};

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
};

describe('Global Facets Panel Page Layout', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should render page', () => {
    render(<GlobalFacetAttributesPageLayout {...defaultProps} />);

    expect(screen.getByText('hello global')).toBeInTheDocument();
  });

  it('should close and go back to global facets page', async () => {
    const user = userEvent.setup();
    render(<GlobalFacetAttributesPageLayout {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockRouter.push).toHaveBeenCalledWith(
      `/global/facets/edit/${ruleSetId}`
    );
  });
});
