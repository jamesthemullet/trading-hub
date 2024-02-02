import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './_app';
import { createMockNextRouter } from '../test/create-mock-next-router';

describe('App', () => {
  it('renders with children', () => {
    render(
      <App
        Component={() => <div>hello</div>}
        pageProps={{
          appProps: {
            config: {},
            optimizelyDatafile: {},
          },
          session: null,
        }}
        router={createMockNextRouter()}
      />
    );

    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});
