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

    it('should render the button without children', () => {
      render(
        <CombinedDropdown {...defaultProps}>
          <div>Content</div>
        </CombinedDropdown>
      );

      expect(screen.queryByText('Content')).not.toBeVisible();
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
      const { rerender } = render(
        <CombinedDropdown {...defaultProps}>
          <div>Content</div>
        </CombinedDropdown>
      );

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button'));
      expect(defaultProps.onClose).toHaveBeenCalled();
      rerender(
        <CombinedDropdown {...defaultProps}>
          <div>Content</div>
        </CombinedDropdown>
      );
      expect(screen.queryByText('Content')).not.toBeVisible();
    });

    it('should render content starting from left', async () => {
      const user = userEvent.setup();
      render(<CombinedDropdown {...defaultProps}>Content</CombinedDropdown>);

      await user.click(screen.getByRole('button'));
      expect(screen.getByText('Content')).toBeVisible();
      expect(screen.getByText('Content')).toHaveStyleRule('left', '0');
    });

    it('should align content from right', async () => {
      const user = userEvent.setup();
      render(
        <CombinedDropdown {...defaultProps} alignContentTowards="right">
          Content
        </CombinedDropdown>
      );

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('Content')).toBeVisible();
      expect(screen.getByText('Content')).toHaveStyleRule('right', '0');
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
      expect(dropdownHeader).toHaveAttribute('aria-haspopup', 'listbox');
      expect(dropdownHeader).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByText('Select an action')).toBeVisible();
      expect(screen.queryByText('Include only')).not.toBeVisible();
      expect(screen.queryByText('Exclude only')).not.toBeVisible();
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
      await user.click(screen.getByRole('button'));

      expect(dropdownHeader).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Select an action')).toBeVisible();
      expect(screen.getByText('Include only')).toBeVisible();
      expect(screen.getByText('Exclude only')).toBeVisible();
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
      await user.click(screen.getByRole('button'));

      expect(dropdownHeader).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Select an action')).toBeVisible();
      expect(screen.getByText('Include only')).toBeVisible();
      expect(screen.getByText('Exclude only')).toBeVisible();
      expect(screen.getByText('Algo control')).toBeVisible();
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

      expect(screen.getByText('Select an action')).toBeVisible();

      const dropdownHeader = screen.getByTestId(
        'button to open facet order dropdown'
      );
      await user.click(dropdownHeader);

      const alwaysHideOption = screen.getByText('Exclude only');
      await user.click(alwaysHideOption);

      expect(screen.getByText('Include only')).not.toBeVisible();
      expect(screen.getAllByText('Exclude only')[0]).toBeVisible();
      expect(screen.queryAllByText('Exclude only')[1]).not.toBeVisible();
      expect(screen.queryByText('Select an action')).not.toBeInTheDocument();
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
      await user.click(dropdownHeader);

      const algoControlOption = screen.getByText('Algo control');
      await user.click(algoControlOption);

      expect(screen.getByText('Include only')).not.toBeVisible();
      expect(screen.getAllByText('Algo control')[0]).toBeVisible();
      expect(screen.queryAllByText('Algo control')[1]).not.toBeVisible();
      expect(screen.queryByText('Select an action')).not.toBeInTheDocument();
      expect(dropdownHeader).toHaveAttribute('aria-expanded', 'false');
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

      expect(
        screen.getByRole('button', { name: 'Select country' })
      ).toBeVisible();
      expect(screen.queryByText('UK only marksandspencer')).not.toBeVisible();
      expect(screen.queryByText('IE only marksandspencer')).not.toBeVisible();
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

      expect(screen.queryByText('UK only marksandspencer')).not.toBeVisible();
      expect(screen.queryByText('IE only marksandspencer')).not.toBeVisible();

      await user.click(dropdownButton);

      expect(screen.getByText('UK only marksandspencer')).toBeVisible();
      expect(screen.getByText('IE only marksandspencer')).toBeVisible();
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

      expect(screen.getByLabelText('select UK market only')).toBeVisible();
      expect(screen.getByLabelText('select IE market only')).toBeVisible();
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

      const showUK = screen.getByLabelText('select UK market only');

      await user.click(showUK);

      expect(onChange).toHaveBeenCalledWith('UK');
    });
  });
});
