// spec: specs/binary-timer-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { BinaryTimerPage } from './pages/BinaryTimerPage';

const addDurations = [1, 2, 3, 5, 10, 15, 30, 60];

test.describe('Countdown', () => {
  test('Countdown progression and stopping', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    // 1. Start a 1m countdown and wait for its time and bits to advance.
    await app.openSetup();
    await app.selectPreset('1m');
    await expect(app.summary).toHaveText('1 minute');
    await app.start();
    await expect(page).toHaveURL(/\/binarytimer\/\?time=60$/);
    await expect(app.button('Stop')).toBeVisible();
    const startingText = await app.summary.textContent();
    await expect.poll(() => app.summary.textContent()).not.toBe(startingText);
    const countdownState = await page.evaluate(() => {
      const summary = document.querySelector('p')?.textContent ?? '';
      const bits = [...document.querySelectorAll('button[aria-label^="bit-"]')]
        .map((bit) => bit.getAttribute('title') ?? '')
        .join('');
      return { summary, bitValue: Number.parseInt(bits, 2) };
    });
    expect(countdownState.summary).toMatch(/\d+ seconds/);
    const remainingSeconds = Number(countdownState.summary.match(/(\d+) seconds?/)?.[1]);
    expect(countdownState.bitValue).toBe(remainingSeconds);

    // 2. Press Stop and verify the timer returns to setup.
    await app.stop();
    await expect(page).toHaveURL(/\/binarytimer\/$/);
    await expect(app.button('Start')).toBeVisible();
    await expect(app.button('Stop')).toHaveCount(0);
  });

  for (const minutes of addDurations) {
    test(`Add ${minutes}m`, async ({ page }) => {
      const app = new BinaryTimerPage(page);

      await app.freezeTime();
      await app.openSetup();
      await app.selectPreset('1m');
      await app.start();
      await expect(app.summary).toHaveText('1 minute');
      await expect(app.button('Stop')).toBeVisible();

      const before = durationInSeconds((await app.summary.textContent()) ?? '');
      const addTimeButton = app.button(`${minutes}m`);
      await expect(addTimeButton).toBeVisible();
      await addTimeButton.click();
      await expect
        .poll(async () => durationInSeconds((await app.summary.textContent()) ?? ''))
        .toBe(before + minutes * 60);

      const afterAdd = durationInSeconds((await app.summary.textContent()) ?? '');
      await page.clock.runFor(1000);
      await expect
        .poll(async () => durationInSeconds((await app.summary.textContent()) ?? ''))
        .toBe(afterAdd - 1);
    });
  }

  test('Completion audio', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.open('/binarytimer/?time=3');
    await expect(app.button('Stop')).toBeVisible();
    await expect(app.audio('bee')).toHaveJSProperty('muted', false);
    await expect(app.audio('doo')).toHaveJSProperty('muted', false);
    await expect(page).toHaveURL(/\/binarytimer\/$/, { timeout: 10000 });
    await expect(app.heading).toBeVisible();
  });

  test('Muted completion', async ({ page }) => {
    const app = new BinaryTimerPage(page);
    await app.openSetup();
    await app.click('Mute');
    await expect(app.button('Unmute')).toBeVisible();
    await app.open('/binarytimer/?time=3');
    await expect(app.button('Stop')).toBeVisible();
    await expect(app.audio('bee')).toHaveJSProperty('muted', true);
    await expect(app.audio('doo')).toHaveJSProperty('muted', true);
    await expect(page).toHaveURL(/\/binarytimer\/$/, { timeout: 10000 });
  });

  test('Zero state', async ({ page }) => {
    const app = new BinaryTimerPage(page);
    await app.mockAudioPlayback('pending');
    await app.freezeTime();
    await app.open('/binarytimer/?time=1');
    await expect(app.summary).toHaveText('1 second');
    await page.clock.runFor(1000);
    await expect(app.summary).toHaveText("Time's up!");
    await expect(app.locator('.pointer-events-none')).toHaveCSS('pointer-events', 'none');
  });
});

const durationInSeconds = (text: string): number => {
  const units: Record<string, number> = { day: 86400, hour: 3600, minute: 60, second: 1 };
  let total = 0;
  for (const match of text.matchAll(/(\d+) (days?|hours?|minutes?|seconds?)/g)) {
    total += Number(match[1]) * units[match[2].replace(/s$/, '')];
  }
  return total;
};