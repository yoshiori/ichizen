import React from 'react';
import { render } from '@testing-library/react-native';
import { GlobalCounter } from '../src/components/GlobalCounter';

describe('GlobalCounter', () => {
  it('should render total count', () => {
    const { getByText } = render(<GlobalCounter totalCount={12345} />);
    
    expect(getByText('12,345')).toBeTruthy();
  });

  it('should render today count', () => {
    const { getByText } = render(<GlobalCounter todayCount={123} />);
    
    expect(getByText('123')).toBeTruthy();
  });

  it('should render both counts', () => {
    const { getByText } = render(
      <GlobalCounter totalCount={12345} todayCount={123} />
    );
    
    expect(getByText('12,345')).toBeTruthy();
    expect(getByText('123')).toBeTruthy();
  });

  it('should render loading state when no counts provided', () => {
    const { getByTestId } = render(<GlobalCounter />);
    
    expect(getByTestId('counter-loading')).toBeTruthy();
  });

  it('should render earth animation', () => {
    const { getByTestId } = render(<GlobalCounter totalCount={100} />);
    
    expect(getByTestId('earth-animation')).toBeTruthy();
  });
});