import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import { AccessDeny } from './access-deny';

describe('AccessDeny', () => {
  it('renders the required role in quotes when requiredRole is provided', () => {
    renderWithProviders(<AccessDeny requiredRole="Cat.R" />);

    const message = screen.getByText(/you don't have access to this page/i);
    expect(message).toHaveTextContent(
      'to acquire "Cat.R" access role in order to see this resource.'
    );
    expect(
      screen.getByRole('link', {
        name: /please contact admin on our teams channel/i,
      })
    ).toHaveAttribute(
      'href',
      'https://teams.microsoft.com/l/channel/19%3A69011a4ab2784a5b8c74bc7ad61472d7%40thread.tacv2/%5BSquad%5D%20Search%20-%20General?groupId=09be67e3-2208-45f2-9eaf-41d6c22743bb&tenantId=bd5c6713-7399-4b31-be79-78f2d078e543'
    );
  });

  it('renders access text without quotes when requiredRole is not provided', () => {
    renderWithProviders(<AccessDeny />);

    const message = screen.getByText(/you don't have access to this page/i);
    expect(message).toHaveTextContent(
      'to acquire access in order to see this resource.'
    );
    expect(message).not.toHaveTextContent('"');
  });
});
