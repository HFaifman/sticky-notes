import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import SizeFields from './SizeFields';

function renderFields(overrides: Partial<Parameters<typeof SizeFields>[0]> = {}) {
  const props = {
    width: '220',
    height: '190',
    isWidthInvalid: false,
    isHeightInvalid: false,
    onWidthChange: vi.fn(),
    onHeightChange: vi.fn(),
    ...overrides,
  };
  render(<SizeFields {...props} />);
  return props;
}

describe('SizeFields', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the current values with their allowed ranges', () => {
    renderFields();

    const width = screen.getByLabelText('Width');
    const height = screen.getByLabelText('Height');
    expect(width).toHaveValue(220);
    expect(width).toHaveAttribute('min', '140');
    expect(width).toHaveAttribute('max', '500');
    expect(height).toHaveValue(190);
    expect(height).toHaveAttribute('min', '120');
    expect(height).toHaveAttribute('max', '500');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('reports raw input values on change', () => {
    const props = renderFields();

    fireEvent.change(screen.getByLabelText('Width'), { target: { value: '300' } });
    fireEvent.change(screen.getByLabelText('Height'), { target: { value: '250' } });

    expect(props.onWidthChange).toHaveBeenCalledWith('300');
    expect(props.onHeightChange).toHaveBeenCalledWith('250');
  });

  it('links an accessible error to an invalid width', () => {
    renderFields({ width: '900', isWidthInvalid: true });

    const width = screen.getByLabelText('Width');
    expect(width).toHaveAttribute('aria-invalid', 'true');
    expect(width).toHaveAccessibleDescription(
      'Width must be a whole number between 140 and 500 pixels.',
    );
    expect(screen.getByLabelText('Height')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });

  it('links an accessible error to an invalid height', () => {
    renderFields({ height: '50', isHeightInvalid: true });

    const height = screen.getByLabelText('Height');
    expect(height).toHaveAttribute('aria-invalid', 'true');
    expect(height).toHaveAccessibleDescription(
      'Height must be a whole number between 120 and 500 pixels.',
    );
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });

  it('shows both errors when both dimensions are invalid', () => {
    renderFields({ isWidthInvalid: true, isHeightInvalid: true });

    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });
});
