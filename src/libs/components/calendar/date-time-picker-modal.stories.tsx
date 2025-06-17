import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { DateTimePickerModal } from './date-time-picker-modal';

const meta: Meta<typeof DateTimePickerModal> = {
  title: 'Components/Date Time Picker Modal',
  tags: ['autodocs'],
  component: DateTimePickerModal,
  argTypes: {
    dateTime: {
      control: 'object',
      description: 'Current date/time range selected',
    },
    onUpdateDateTimeRange: {
      action: 'onUpdateDateTimeRange',
      description: 'Callback when date/time range changes',
    },
    writeEnabled: {
      control: 'boolean',
      description: 'Toggles whether the date/time picker is interactive',
    },
    label: {
      control: 'text',
      description: 'Label displayed on the input field',
    },
    showCalendarIcon: {
      control: 'boolean',
      description: 'Shows or hides the calendar icon',
    },
  },
};

export default meta;

type Story = StoryObj<typeof DateTimePickerModal>;

export const Default: Story = {
  args: {
    dateTime: [null, null],
    label: 'Select a date range',
    showCalendarIcon: true,
    writeEnabled: true,
    onUpdateDateTimeRange: fn(),
  },
};
