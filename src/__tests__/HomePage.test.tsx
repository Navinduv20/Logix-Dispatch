import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage';

function setup() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/track/:id" element={<div data-testid="track-page">tracking</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  it('renders the hero headline', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/real-time logistics/i);
  });

  it('navigates to the tracking page for a valid number', async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByPlaceholderText(/enter tracking number/i), 'LGX-100001');
    await user.click(screen.getByRole('button', { name: /track shipment/i }));
    expect(await screen.findByTestId('track-page')).toBeInTheDocument();
  });

  it('shows an error for an unknown tracking number', async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByPlaceholderText(/enter tracking number/i), 'NOT-A-REAL-ONE');
    await user.click(screen.getByRole('button', { name: /track shipment/i }));
    expect(screen.getByText(/could not find that tracking number/i)).toBeInTheDocument();
  });

  it('rejects an empty submission', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: /track shipment/i }));
    expect(screen.getByText(/please enter a tracking number/i)).toBeInTheDocument();
  });
});
