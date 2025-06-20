import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { FacetOrderDropdown } from './facet-order-dropdown';

const meta: Meta<typeof FacetOrderDropdown> = {
  title: 'Components/Dropdowns/FacetOrderDropdown',
  component: FacetOrderDropdown,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'radio',
      options: ['select', 'included', 'algoControl', 'excluded'],
      description: 'Current state of facet display type',
    },
    attribute: {
      control: 'text',
      description: 'Name of the facet attribute',
    },
    hasAlgoControl: {
      control: 'boolean',
      description: 'Enables the algoControl option in the dropdown',
    },
    writeEnabled: {
      control: 'boolean',
      description: 'Toggles editable or read-only state',
    },
    onChange: {
      action: 'onChange',
      description: 'Callback fired whenever a dropdown option is chosen',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof FacetOrderDropdown>;

export const Default: Story = {
  args: {
    status: 'included',
    attribute: 'Example Attribute',
    hasAlgoControl: false,
    writeEnabled: true,
    onChange: fn(),
  },
};
export const WithAlgoControl: Story = {
  args: {
    status: 'algoControl',
    attribute: 'Example Attribute',
    hasAlgoControl: true,
    writeEnabled: true,
    onChange: fn(),
  },
};
export const ReadOnly: Story = {
  args: {
    status: 'included',
    attribute: 'Example Attribute',
    hasAlgoControl: false,
    writeEnabled: false,
    onChange: fn(),
  },
};
