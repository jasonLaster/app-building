import { test as base, expect } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const test = base.extend<{}, { workerIndex: number }>({
  workerIndex: [async ({}, use, workerInfo) => {
    await use(workerInfo.workerIndex);
  }, { scope: 'worker' }],

  context: async ({ context, workerIndex }, use) => {
    await context.addCookies([{
      name: 'test-worker',
      value: String(workerIndex),
      domain: 'localhost',
      path: '/',
    }]);
    await use(context);
  },
});

export { expect };
