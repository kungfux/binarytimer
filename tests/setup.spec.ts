// spec: specs/binary-timer-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { BinaryTimerPage } from './pages/BinaryTimerPage';

const presets = [
  { label: '1m', seconds: 60, summary: '1 minute' },
  { label: '2m', seconds: 120, summary: '2 minutes' },
  { label: '3m', seconds: 180, summary: '3 minutes' },
  { label: '5m', seconds: 300, summary: '5 minutes' },
  { label: '10m', seconds: 600, summary: '10 minutes' },
  { label: '15m', seconds: 900, summary: '15 minutes' },
  { label: '30m', seconds: 1800, summary: '30 minutes' },
  { label: '60m', seconds: 3600, summary: '1 hour' },
];

test.describe('Timer Setup', () => {
  test('Setup defaults', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    // Open setup in a fresh context.
    await app.openSetup();
    await expect(app.text('Select bits and press Start')).toBeVisible();
    await expect(app.button('Start')).toBeDisabled();
    await expect(app.button('1m')).toBeVisible();
    await expect(app.button('Switch to stopwatch mode')).toBeVisible();
    await expect(app.button('Hide optional controls')).toBeVisible();
    await expect(app.button('Mute')).toBeVisible();
  });

  test('Bit selection', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.openSetup();
    await app.toggleBit(0);
    await expect(app.bits).toHaveCount(8);
    await expect(app.text('8 seconds')).toBeVisible();
    await app.toggleBit(7);
    await expect(app.text('9 seconds')).toBeVisible();
    await expect(app.button('Start')).toBeEnabled();
    await app.toggleBit(4);
    await expect(app.bits).toHaveCount(4);
    await app.toggleBit(3);
    await expect(app.text('Select bits and press Start')).toBeVisible();
    await expect(app.button('Start')).toBeDisabled();
    await expect(app.bits).toHaveCount(4);
    await app.toggleBit(0);
    await expect(app.text('8 seconds')).toBeVisible();
    await app.start();
    await expect(page).toHaveURL(/\/binarytimer\/\?time=8$/);
    await expect(app.button('Stop')).toBeVisible();
  });

  for (const preset of presets) {
    test(`Preset ${preset.label}`, async ({ page }) => {
      const app = new BinaryTimerPage(page);

      await app.openSetup();
      await app.selectPreset(preset.label);
      await expect(app.text(preset.summary, true)).toBeVisible();
      await expect(app.button('Start')).toBeEnabled();
      await expect.poll(() => app.bitValue()).toBe(preset.seconds);
    });
  }

  test('Bit boundaries', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.openSetup();
    await app.selectPreset('1m');
    await expect(app.bits).toHaveCount(8);
    await app.toggleBit(2);
    await expect.poll(() => app.bitValue()).toBe(28);
    await app.toggleBit(3);
    await expect.poll(() => app.bitValue()).toBe(12);
    await app.toggleBit(6);
    await expect.poll(() => app.bitValue()).toBe(14);
    await app.toggleBit(7);
    await expect.poll(() => app.bitValue()).toBe(15);
    await expect(app.text('15 seconds', true)).toBeVisible();

    await app.selectPreset('1m');
    await app.toggleBit(2);
    await expect.poll(() => app.bitValue()).toBe(28);
    await app.toggleBit(4);
    await expect.poll(() => app.bitValue()).toBe(20);
    await app.toggleBit(5);
    await expect.poll(() => app.bitValue()).toBe(16);
    await expect(app.text('16 seconds', true)).toBeVisible();
  });

  test('Query duration', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.mockAudioPlayback('reject');
    await app.freezeTime();
    await app.open('/binarytimer/?time=65');
    await expect(page).toHaveURL(/\/binarytimer\/\?time=65$/);
    await expect(app.text('Please stand by', true)).toBeVisible();
    await expect(app.text('1 minute 5 seconds', true)).toBeVisible();
    await expect(app.bits).toHaveCount(8);
  });

  test('Invalid query values', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.open('/binarytimer/?time=0');
    await expect(app.heading).toBeVisible();
    await expect(app.text('NaN')).toHaveCount(0);
    await app.open('/binarytimer/?time=abc');
    await expect(app.heading).toBeVisible();
    await expect(app.text('NaN')).toHaveCount(0);
  });

  test('Maximum query value', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.open('/binarytimer/?time=68719476735');
    await expect(page).toHaveURL(/\/binarytimer\/\?time=68719476735$/);
    await expect(app.text('Please stand by', true)).toBeVisible();
    await expect(app.bits).toHaveCount(36);
  });
});