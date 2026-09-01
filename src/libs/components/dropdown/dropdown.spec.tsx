import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  CombinedDropdown,
  DropdownVariant,
  getSelectedRuleTypeFilterOption,
} from './dropdown';

const defaultProps = {
  variant: DropdownVariant.Generic,
  isOpen: false,
  onOpen: jest.fn(),
  label: 'CombinedDropdown',
  onClose: jest.fn(),
};

describe('CombinedDropdown', () => {
  describe('getSelectedRuleTypeFilterOption', () => {
    it('should return the selected option when one is selected', () => {
      const option = getSelectedRuleTypeFilterOption([
        {
          index: 0,
          label: 'All rule types',
          selected: false,
          value: undefined,
          ariaLabel: 'show all rule types',
        },
        {
          index: 1,
          label: 'Ranking rules',
          selected: true,
          value: 'RANKING',
          ariaLabel: 'show rule types with ranking rules',
        },
      ]);

      expect(option?.label).toBe('Ranking rules');
    });

    it('should fall back to first option when none selected', () => {
      const option = getSelectedRuleTypeFilterOption([
        {
          index: 0,
          label: 'All rule types',
          selected: false,
          value: undefined,
          ariaLabel: 'show all rule types',
        },
        {
          index: 1,
          label: 'Ranking rules',
          selected: false,
          value: 'RANKING',
          ariaLabel: 'show rule types with ranking rules',
        },
      ]);

      expect(option?.label).toBe('All rule types');
    });

    it('should return undefined when options array is empty', () => {
      const option = getSelectedRuleTypeFilterOption([]);

      expect(option).toBeUndefined();
    });
  });

  describe('generic variant', () => {
    afterEach(() => {
      defaultProps.onOpen.mockClear();
      defaultProps.onClose.mockClear();
    });

    it('should use ariaLabel without headingText prefix when label is empty', () => {
      render(
        <CombinedDropdown {...defaultProps} label="" ariaLabel="custom label">
          <div>Content</div>
        </CombinedDropdown>
      );

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'custom label'
      );
    });

    it('should fall back to variant name in aria-label when label is empty and no ariaLabel', () => {
      render(
        <CombinedDropdown {...defaultProps} label="">
          <div>Content</div>
        </CombinedDropdown>
      );

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'select generic'
      );
    });

    it('should render the button with children', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <CombinedDropdown {...defaultProps}>
          <div>Content</div>
        </CombinedDropdown>
      );

      await user.click(screen.getByRole('button'));
      expect(defaultProps.onOpen).toHaveBeenCalled();
      rerender(
        <CombinedDropdown {...defaultProps}>
          <div>Content</div>
        </CombinedDropdown>
      );
      expect(screen.getByText('Content')).toBeVisible();
    });

    it('should close CombinedDropdown when button is clicked again when already open', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown {...defaultProps}>
          <div>Content</div>
        </CombinedDropdown>
      );

      const button = screen.getByRole('button');
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      await user.click(button);
      expect(defaultProps.onClose).toHaveBeenCalled();
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should close CombinedDropdown when escape is pressed', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown {...defaultProps}>
          <div>Content</div>
        </CombinedDropdown>
      );

      await user.click(screen.getByRole('button'));
      const dialogButton = screen.getByRole('button');
      dialogButton.focus();
      await user.keyboard('{Escape}');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should close CombinedDropdown on outside click', async () => {
      const user = userEvent.setup();
      render(
        <>
          <p>outside</p>
          <CombinedDropdown {...defaultProps}>
            <div>Content</div>
          </CombinedDropdown>
        </>
      );

      await user.click(screen.getByRole('button'));
      const dialogButton = screen.getByRole('button');
      dialogButton.focus();

      await user.click(screen.getByText('outside'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should not call onClose when CombinedDropdown is not open', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown {...defaultProps}>
          <div>Content</div>
        </CombinedDropdown>
      );

      const dialogButton = screen.getByRole('button');
      dialogButton.focus();
      await user.keyboard('{Escape}');
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('should open on space key when already closed', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown {...defaultProps}>
          <div>Content</div>
        </CombinedDropdown>
      );

      const dialogButton = screen.getByRole('button');
      dialogButton.focus();
      await user.keyboard(' ');
      expect(defaultProps.onOpen).toHaveBeenCalled();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('should close on space key when already open', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown {...defaultProps}>
          <div>Content</div>
        </CombinedDropdown>
      );

      await user.click(screen.getByRole('button'));
      const dialogButton = screen.getByRole('button');
      dialogButton.focus();
      await user.keyboard(' ');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should close on shift tab when already open', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown {...defaultProps}>
          <div>Content</div>
        </CombinedDropdown>
      );

      await user.click(screen.getByRole('button'));
      const dialogButton = screen.getByRole('button');
      dialogButton.focus();
      await user.tab({ shift: true });
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should not close on non-shift tab when already open', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown {...defaultProps}>
          <div>Content</div>
        </CombinedDropdown>
      );

      const dialogButton = screen.getByRole('button');
      dialogButton.focus();
      await user.tab();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('should not close on shift tab when already closed', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown {...defaultProps}>
          <div>Content</div>
        </CombinedDropdown>
      );

      const dialogButton = screen.getByRole('button');
      dialogButton.focus();
      await user.tab({ shift: true });
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('facetOrder variant', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render the dropdown', () => {
      render(
        <CombinedDropdown
          variant={DropdownVariant.FacetOrder}
          isWriteEnabled
          onChange={jest.fn()}
        />
      );

      const dropdownHeader = screen.getByTestId(
        'button to open facet order dropdown'
      );
      expect(dropdownHeader).toHaveAttribute('aria-haspopup', 'menu');
      expect(dropdownHeader).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByText('Select an action')).toBeVisible();
    });

    it('should only show the status in read only mode', () => {
      render(
        <CombinedDropdown
          variant={DropdownVariant.FacetOrder}
          isWriteEnabled={false}
          onChange={jest.fn()}
          status="algoControl"
        />
      );

      expect(screen.queryByText('Select an action')).not.toBeInTheDocument();
      expect(screen.getByText('Algo control')).toBeVisible();
    });

    it('should open the dropdown and display the options when button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown
          variant={DropdownVariant.FacetOrder}
          isWriteEnabled
          onChange={jest.fn()}
          attribute="color"
        />
      );

      const dropdownHeader = screen.getByTestId(
        'button to open facet order dropdown for color'
      );

      expect(dropdownHeader).toHaveAttribute('aria-expanded', 'false');

      await user.click(dropdownHeader);

      expect(dropdownHeader).toHaveAttribute('aria-expanded', 'true');
    });

    it('should open the dropdown with hasAlgoControl and display the options when button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown
          variant={DropdownVariant.FacetOrder}
          isWriteEnabled
          onChange={jest.fn()}
          hasAlgoControl
          attribute="color"
        />
      );

      const dropdownHeader = screen.getByTestId(
        'button to open facet order dropdown for color'
      );

      expect(dropdownHeader).toHaveAttribute('aria-expanded', 'false');

      await user.click(dropdownHeader);

      expect(dropdownHeader).toHaveAttribute('aria-expanded', 'true');
    });

    it('should change the selected option when an option is clicked, and close the dropdown', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown
          variant={DropdownVariant.FacetOrder}
          isWriteEnabled
          onChange={jest.fn()}
        />
      );

      const dropdownHeader = screen.getByTestId(
        'button to open facet order dropdown'
      );

      expect(dropdownHeader).toHaveAttribute('aria-expanded', 'false');
      expect(dropdownHeader).toHaveTextContent('Select an action');

      await user.click(dropdownHeader);
      expect(dropdownHeader).toHaveAttribute('aria-expanded', 'true');

      const alwaysHideOption = screen.getByText('Exclude only');
      await user.click(alwaysHideOption);

      expect(dropdownHeader).toHaveTextContent('Exclude only');
      expect(dropdownHeader).toHaveAttribute('aria-expanded', 'false');
    });

    it('when hasAlgoControl should change the selected option when an option is clicked, and close the dropdown', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown
          variant={DropdownVariant.FacetOrder}
          isWriteEnabled
          onChange={jest.fn()}
          hasAlgoControl
        />
      );

      expect(screen.getByText('Select an action')).toBeVisible();

      const dropdownHeader = screen.getByTestId(
        'button to open facet order dropdown'
      );

      expect(dropdownHeader).toHaveAttribute('aria-expanded', 'false');
      expect(dropdownHeader).toHaveTextContent('Select an action');
      await user.click(dropdownHeader);
      expect(dropdownHeader).toHaveAttribute('aria-expanded', 'true');

      const algoControlOption = screen.getByText('Algo control');
      await user.click(algoControlOption);

      expect(dropdownHeader).toHaveTextContent('Algo control');
      expect(dropdownHeader).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('pageSize variant', () => {
    it('should call onPageSizeChange with current page when in range', async () => {
      const user = userEvent.setup();
      const onPageSizeChange = jest.fn();

      render(
        <CombinedDropdown
          variant={DropdownVariant.PageSize}
          label="10"
          pageSizes={[10, 20]}
          currentPage={2}
          currentPageSize={10}
          totalItems={100}
          onPageSizeChange={onPageSizeChange}
        />
      );

      await user.click(screen.getByRole('button', { name: 'select 10' }));
      await user.click(screen.getByRole('menuitemradio', { name: '10' }));

      expect(onPageSizeChange).toHaveBeenCalledWith(2, 10);
    });

    it('should reset to page 1 when totalItems is undefined', async () => {
      const user = userEvent.setup();
      const onPageSizeChange = jest.fn();

      render(
        <CombinedDropdown
          variant={DropdownVariant.PageSize}
          label="50"
          pageSizes={[50]}
          currentPage={2}
          currentPageSize={10}
          onPageSizeChange={onPageSizeChange}
        />
      );

      await user.click(screen.getByRole('button', { name: 'select 50' }));
      await user.click(screen.getByRole('menuitemradio', { name: '50' }));

      expect(onPageSizeChange).toHaveBeenCalledWith(1, 50);
    });

    it('should not call onPageSizeChange when currentPage is undefined', async () => {
      const user = userEvent.setup();
      const onPageSizeChange = jest.fn();

      render(
        <CombinedDropdown
          variant={DropdownVariant.PageSize}
          label="10"
          pageSizes={[10]}
          currentPageSize={10}
          totalItems={100}
          onPageSizeChange={onPageSizeChange}
        />
      );

      await user.click(screen.getByRole('button', { name: 'select 10' }));
      await user.click(screen.getByRole('menuitemradio', { name: '10' }));

      expect(onPageSizeChange).not.toHaveBeenCalled();
    });
  });

  describe('ruleTypeFilter variant', () => {
    it('should call onRuleTypeChange with RANKING when Ranking rules is selected', async () => {
      const user = userEvent.setup();
      const onRuleTypeChange = jest.fn();

      render(
        <CombinedDropdown
          variant={DropdownVariant.RuleTypeFilter}
          onRuleTypeChange={onRuleTypeChange}
          ariaLabel="Filter by rule type"
        />
      );

      await user.click(
        screen.getByRole('button', {
          name: 'Filter by rule type - currently All rule types',
        })
      );
      await user.click(screen.getByText('Ranking rules'));

      expect(onRuleTypeChange).toHaveBeenCalledWith('RANKING');
    });

    it('should call onRuleTypeChange with FACET when Facet rules is selected', async () => {
      const user = userEvent.setup();
      const onRuleTypeChange = jest.fn();

      render(
        <CombinedDropdown
          variant={DropdownVariant.RuleTypeFilter}
          onRuleTypeChange={onRuleTypeChange}
          ariaLabel="Filter by rule type"
        />
      );

      await user.click(
        screen.getByRole('button', {
          name: 'Filter by rule type - currently All rule types',
        })
      );
      await user.click(screen.getByText('Facet rules'));

      expect(onRuleTypeChange).toHaveBeenCalledWith('FACET');
    });

    it('should call onRuleTypeChange with undefined when All rule types is selected', async () => {
      const user = userEvent.setup();
      const onRuleTypeChange = jest.fn();

      render(
        <CombinedDropdown
          variant={DropdownVariant.RuleTypeFilter}
          onRuleTypeChange={onRuleTypeChange}
          ariaLabel="Filter by rule type"
        />
      );

      await user.click(
        screen.getByRole('button', {
          name: 'Filter by rule type - currently All rule types',
        })
      );
      await user.click(
        screen.getByRole('menuitemradio', { name: 'All rule types' })
      );

      expect(onRuleTypeChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('countryFilter variant', () => {
    it('should render the dropdown', () => {
      render(
        <CombinedDropdown
          variant={DropdownVariant.CountryFilter}
          onChange={jest.fn()}
          ariaLabel="Select country"
        />
      );

      const dropdown = screen.getByLabelText(
        'Select country - currently All marksandspencer.com'
      );

      expect(
        screen.getByRole('button', {
          name: 'Select country - currently All marksandspencer.com',
        })
      ).toBeVisible();

      expect(dropdown).toHaveAttribute('aria-expanded', 'false');
    });

    it('should open the dropdown and display the options when button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown
          variant={DropdownVariant.CountryFilter}
          onChange={jest.fn()}
          ariaLabel="Select country"
        />
      );

      const dropdownButton = screen.getByRole('button', {
        name: 'Select country - currently All marksandspencer.com',
      });
      const dropdown = screen.getByLabelText(
        'Select country - currently All marksandspencer.com'
      );

      expect(dropdown).toHaveAttribute('aria-expanded', 'false');

      await user.click(dropdownButton);

      expect(dropdown).toHaveAttribute('aria-expanded', 'true');
    });

    it('should change the selected option when an option is clicked, and close the dropdown', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(
        <CombinedDropdown
          variant={DropdownVariant.CountryFilter}
          onChange={onChange}
          ariaLabel="Select country"
        />
      );

      const dropdownButton = screen.getByRole('button', {
        name: 'Select country - currently All marksandspencer.com',
      });

      await user.click(dropdownButton);

      const showUK = screen.getByText('UK only marksandspencer');

      await user.click(showUK);

      expect(onChange).toHaveBeenCalledWith('UK');
    });
  });

  describe('countrySelector variant', () => {
    it('should render the dropdown', () => {
      render(
        <CombinedDropdown
          variant={DropdownVariant.CountrySelector}
          selectedCountryCode="UK_IE"
          isWriteEnabled
          onChange={jest.fn()}
          ariaLabel="Select country"
        />
      );

      expect(
        screen.getByRole('button', {
          name: 'Select country - currently UK/IE Market',
        })
      ).toBeVisible();
    });

    it('should open the dropdown and display the options when button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown
          variant={DropdownVariant.CountrySelector}
          isWriteEnabled
          onChange={jest.fn()}
          ariaLabel="Select country"
        />
      );

      const dropdownButton = screen.getByRole('button', {
        name: 'Select country - currently UK/IE Market',
      });
      await user.click(dropdownButton);

      expect(
        screen.getByRole('menuitemradio', { name: 'UK market only' })
      ).toBeVisible();
      expect(
        screen.getByRole('menuitemradio', { name: 'IE market only' })
      ).toBeVisible();
    });

    it('should change the selected option when an option is clicked, and close the dropdown', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(
        <CombinedDropdown
          variant={DropdownVariant.CountrySelector}
          isWriteEnabled
          onChange={onChange}
          ariaLabel="Select country"
        />
      );

      const dropdownButton = screen.getByRole('button', {
        name: 'Select country - currently UK/IE Market',
      });

      await user.click(dropdownButton);

      const showUK = screen.getByRole('menuitemradio', {
        name: 'UK market only',
      });

      await user.click(showUK);

      expect(onChange).toHaveBeenCalledWith('UK');
    });
  });
});
