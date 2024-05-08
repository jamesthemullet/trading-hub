import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';

import { createMockNextRouter } from '../test/create-mock-next-router';
import App from './_app.page';

describe('App', () => {
  it('renders with children', () => {
    render(
      <App
        Component={() => <div>hello</div>}
        pageProps={{
          session: null,
        }}
        router={createMockNextRouter()}
      />
    );

    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});
