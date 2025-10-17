import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { CombinedDropdown } from './dropdown';

const meta: Meta<typeof CombinedDropdown> = {
  title: 'Components/Dropdowns/CombinedDropdown',
  component: CombinedDropdown,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['generic', 'countryFilter', 'countrySelector', 'facetOrder'],
      description: 'Select the dropdown variant',
    },
    writeEnabled: {
      control: 'boolean',
      description: 'Enables or disables editing functionality',
    },
    // Generic
    label: {
      control: 'text',
      description: 'Label for the generic dropdown button',
    },
    onOpen: {
      action: 'onOpen',
      description: 'Triggered when the dropdown is opened',
    },
    onClose: {
      action: 'onClose',
      description: 'Triggered when the dropdown is closed',
    },
    // Country dropdown
    onChange: {
      action: 'onChange',
      description:
        'Triggered when a country is selected or facet status changes',
    },
    selectedCountryCode: {
      control: 'text',
      description: 'Shows which country is currently selected',
    },
    // Facet order
    status: {
      control: 'radio',
      options: ['select', 'included', 'algoControl', 'excluded'],
      description: 'Which facet state should be displayed',
    },
    attribute: {
      control: 'text',
      description: 'Facet attribute name',
    },
    hasAlgoControl: {
      control: 'boolean',
      description:
        'Enables or disables the algoControl option in the facet dropdown',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof CombinedDropdown>;

const GenericTemplate = (args: Story['args']) => {
  const [content, setContent] = useState('Some custom dropdown content');
  const { variant = 'generic', ...rest } = args ?? {};
  return (
    <CombinedDropdown variant={variant} {...rest}>
      <div style={{ padding: '1rem', width: '200px' }}>
        {content}
        <br />
        <button type="button" onClick={() => setContent('Updated content')}>
          Update Content
        </button>
      </div>
    </CombinedDropdown>
  );
};

export const Generic: Story = {
  args: {
    variant: 'generic',
    writeEnabled: true,
    label: 'Open Generic Dropdown',
  },
  render: (args) => <GenericTemplate {...args} />,
};

export const CountryFilter: Story = {
  args: {
    variant: 'countryFilter',
    writeEnabled: true,
  },
  render: (args) => <CombinedDropdown {...args} />,
};

export const CountrySelector: Story = {
  args: {
    variant: 'countrySelector',
    writeEnabled: true,
    selectedCountryCode: 'UK_IE',
  },
  render: (args) => {
    return (
      <CombinedDropdown
        {...args}
        selectedCountryCode={args.selectedCountryCode}
        onChange={fn()}
      />
    );
  },
};

export const FacetOrder: Story = {
  args: {
    variant: 'facetOrder',
    status: 'included',
    attribute: 'Example Attribute',
    hasAlgoControl: true,
    writeEnabled: true,
  },
  render: (args) => <CombinedDropdown {...args} />,
};

export const FacetOrderReadOnly: Story = {
  args: {
    variant: 'facetOrder',
    status: 'included',
    hasAlgoControl: false,
    writeEnabled: false,
    attribute: 'ReadOnly Attribute',
  },
  render: (args) => <CombinedDropdown {...args} />,
};
