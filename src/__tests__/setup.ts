import '@testing-library/jest-dom';

// jsdom does not implement matchMedia or ResizeObserver, both of which Recharts touches
if (!window.matchMedia) {
  window.matchMedia = () =>
    ({
      matches: false,
      media: '',
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    } as unknown as MediaQueryList);
}

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = window.ResizeObserver || MockResizeObserver;
