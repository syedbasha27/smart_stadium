import "@testing-library/jest-dom";

// next/link uses IntersectionObserver to prefetch links in the viewport,
// which doesn't exist in jsdom. Stubbing it out keeps test output clean
// without affecting anything the tests actually assert on.
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

// @ts-ignore
global.IntersectionObserver = MockIntersectionObserver;
