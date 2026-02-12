import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CombinedDropdown } from './dropdown';

const defaultProps = {
  variant: 'generic' as const,
  isOpen: false,
  onOpen: jest.fn(),
  label: 'CombinedDropdown',
  onClose: jest.fn(),
};

describe('CombinedDropdown', () => {
  describe('generic variant', () => {
    afterEach(() => {
      defaultProps.onOpen.mockClear();
      defaultProps.onClose.mockClear();
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
          variant="facetOrder"
          writeEnabled
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
          variant="facetOrder"
          writeEnabled={false}
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
          variant="facetOrder"
          writeEnabled
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
          variant="facetOrder"
          writeEnabled
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
          variant="facetOrder"
          writeEnabled
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
          variant="facetOrder"
          writeEnabled
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
          variant="pageSize"
          label="10"
          pageSizes={[10, 20]}
          currentPage={2}
          currentPageSize={10}
          totalItems={100}
          onPageSizeChange={onPageSizeChange}
        />
      );

      await user.click(
        screen.getByRole('button', { name: 'pageSize dropdown' })
      );
      await user.click(screen.getByRole('option', { name: '10' }));

      expect(onPageSizeChange).toHaveBeenCalledWith(2, 10);
    });

    it('should reset to page 1 when totalItems is undefined', async () => {
      const user = userEvent.setup();
      const onPageSizeChange = jest.fn();

      render(
        <CombinedDropdown
          variant="pageSize"
          label="50"
          pageSizes={[50]}
          currentPage={2}
          currentPageSize={10}
          onPageSizeChange={onPageSizeChange}
        />
      );

      await user.click(
        screen.getByRole('button', { name: 'pageSize dropdown' })
      );
      await user.click(screen.getByRole('option', { name: '50' }));

      expect(onPageSizeChange).toHaveBeenCalledWith(1, 50);
    });

    it('should not call onPageSizeChange when currentPage is undefined', async () => {
      const user = userEvent.setup();
      const onPageSizeChange = jest.fn();

      render(
        <CombinedDropdown
          variant="pageSize"
          label="10"
          pageSizes={[10]}
          currentPageSize={10}
          totalItems={100}
          onPageSizeChange={onPageSizeChange}
        />
      );

      await user.click(
        screen.getByRole('button', { name: 'pageSize dropdown' })
      );
      await user.click(screen.getByRole('option', { name: '10' }));

      expect(onPageSizeChange).not.toHaveBeenCalled();
    });
  });

  describe('countryFilter variant', () => {
    it('should render the dropdown', () => {
      render(
        <CombinedDropdown
          variant="countryFilter"
          onChange={jest.fn()}
          ariaLabel="Select country"
        />
      );

      const dropdown = screen.getByLabelText('Select country');

      expect(
        screen.getByRole('button', { name: 'Select country' })
      ).toBeVisible();

      expect(dropdown).toHaveAttribute('aria-expanded', 'false');
    });

    it('should open the dropdown and display the options when button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown
          variant="countryFilter"
          onChange={jest.fn()}
          ariaLabel="Select country"
        />
      );

      const dropdownButton = screen.getByRole('button', {
        name: 'Select country',
      });
      const dropdown = screen.getByLabelText('Select country');

      expect(dropdown).toHaveAttribute('aria-expanded', 'false');

      await user.click(dropdownButton);

      expect(dropdown).toHaveAttribute('aria-expanded', 'true');
    });

    it('should change the selected option when an option is clicked, and close the dropdown', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(
        <CombinedDropdown
          variant="countryFilter"
          onChange={onChange}
          ariaLabel="Select country"
        />
      );

      const dropdownButton = screen.getByRole('button', {
        name: 'Select country',
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
          variant="countrySelector"
          selectedCountryCode="UK_IE"
          writeEnabled
          onChange={jest.fn()}
          ariaLabel="Select country"
        />
      );

      expect(
        screen.getByRole('button', {
          name: 'Select country',
        })
      ).toBeVisible();
    });

    it('should open the dropdown and display the options when button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown
          variant="countrySelector"
          writeEnabled
          onChange={jest.fn()}
          ariaLabel="Select country"
        />
      );

      const dropdownButton = screen.getByRole('button', {
        name: 'Select country',
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
          variant="countrySelector"
          writeEnabled
          onChange={onChange}
          ariaLabel="Select country"
        />
      );

      const dropdownButton = screen.getByRole('button', {
        name: 'Select country',
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
