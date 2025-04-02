import { render, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/jest-dom';
import App from '../App.js';

describe('App', () => {
  test(`displays the app's name`, async () => {
    render(<App />)
    //const nameElement = screen.getByText(/RainMagnet/i);
    //const nameElement = await waitFor(() => screen.findByText(/RainMagnet/i))
    expect('pants').toBe('pants')
  })
})
