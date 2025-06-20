import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Dropdown } from './dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdowns/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the dropdown is open',
    },
    label: {
      control: 'text',
      description: 'Label for the dropdown button',
    },
    icon: {
      control: 'text',
      description: 'Optional icon name to display next to the label',
    },
    contentWidth: {
      control: 'text',
      description: 'Width of the dropdown content',
    },
    alignContentTowards: {
      control: 'radio',
      options: ['left', 'right'],
      description: 'Alignment of the dropdown content',
    },
    footerContent: {
      description: 'An optional element rendered at the bottom of the dropdown',
    },
    onOpen: {
      action: 'onOpen',
      description: 'Triggered when the dropdown is opened',
    },
    onClose: {
      action: 'onClose',
      description: 'Triggered when the dropdown is closed',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
  args: {
    isOpen: false,
    label: 'Example Dropdown',
    contentWidth: '220px',
    alignContentTowards: 'left',
  },
  render: (args) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    function handleOpen() {
      setDropdownOpen(true);
      args.onOpen?.();
    }

    function handleClose(
      closingType?: 'icon' | 'button' | 'esc' | 'outsideClick' | 'tab'
    ) {
      setDropdownOpen(false);
      args.onClose?.(closingType);
    }

    return (
      <>
        <Dropdown
          {...args}
          isOpen={dropdownOpen}
          onOpen={handleOpen}
          onClose={handleClose}
        >
          <div style={{ padding: '1rem' }}>Your dropdown content here.</div>
        </Dropdown>
      </>
    );
  },
};
