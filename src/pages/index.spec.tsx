import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom'

import Index from './index';

describe('Index', () => {

  it('renders index page', () => {
    render(
        <Index />
    );

    const expectedWelcomeIntroText = 'Test styled components';
    const headingElement = screen.queryByText(expectedWelcomeIntroText);

    expect(headingElement).toBeVisible();
  });
});
