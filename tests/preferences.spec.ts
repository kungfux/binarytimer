// spec: specs/binary-timer-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { BinaryTimerPage } from './pages/BinaryTimerPage';

test.describe('Preferences', () => {
  test('Stopwatch mode', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.openSetup();
    await app.click('Switch to stopwatch mode');
    await expect(app.text('Press Start to begin')).toBeVisible();
    await expect(app.button('1m')).toHaveCount(0);
  });

  test('Stopwatch counts', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.freezeTime();
    await app.openSetup();
    await app.click('Switch to stopwatch mode');
    await app.start();
    await expect(page).toHaveURL(/\/binarytimer\/\?time=0$/);
    await expect(app.button('Stop')).toBeVisible();
    await expect(app.button('1m')).toHaveCount(0);
    await page.clock.runFor(3000);
    await expect(app.summary).toHaveText('3 seconds');
    expect(await app.bitValue()).toBe(3);
  });

  test('Stopwatch stops', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.openSetup();
    await app.click('Switch to stopwatch mode');
    await app.start();
    await app.stop();
    await expect(page).toHaveURL(/\/binarytimer\/$/);
    await expect(app.text('Press Start to begin')).toBeVisible();
  });

  test('Mode persists', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.openSetup();
    await app.click('Switch to stopwatch mode');
    await app.reload();
    await expect(app.button('Switch to countdown mode')).toBeVisible();
    await expect(app.text('Press Start to begin')).toBeVisible();

    await app.click('Switch to countdown mode');
    await app.reload();
    await expect(app.button('Switch to stopwatch mode')).toBeVisible();
    await expect(app.button('5m')).toBeVisible();
  });

  test('Hidden controls persist', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.openSetup();
    await app.selectPreset('5m');
    await app.start();
    await app.click('Hide optional controls');
    await app.reload();
    await expect(app.button('Show optional controls')).toBeVisible();
    await expect(app.button('1m')).toHaveCount(0);
    await app.click('Show optional controls');
    await expect(app.button('1m')).toBeVisible();
  });

  test('Mute persists', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.openSetup();
    await app.click('Mute');
    await app.selectPreset('1m');
    await app.start();
    await app.reload();
    await expect(app.button('Unmute')).toBeVisible();
    await expect(app.audio('bee')).toHaveJSProperty('muted', true);
    await expect(app.audio('doo')).toHaveJSProperty('muted', true);
  });

  test('Save title', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.openSetup();
    await app.selectPreset('60m');
    await app.start();
    await expect(app.headingNamed('Please stand by')).toBeVisible();
    await expect(app.button('Edit title')).toHaveCount(0);
    await app.selectTitleForEdit();
    await app.saveTitle('Review title');
    await expect(app.headingNamed('Review title')).toBeVisible();
    await app.reload();
    await expect(app.headingNamed('Review title')).toBeVisible();
  });

  test('Discard title', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.openCountdown(3600);
    await expect(app.headingNamed('Please stand by')).toBeVisible();
    await app.selectTitleForEdit();
    await app.titleInput.fill('Unsaved title');
    await app.click('Discard');
    await expect(app.headingNamed('Please stand by')).toBeVisible();
  });

  test('Escape title edit', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.openCountdown(3600);
    await app.selectTitleForEdit();
    await app.titleInput.fill('Escape draft');
    await page.keyboard.press('Escape');
    await expect(app.headingNamed('Please stand by')).toBeVisible();
  });

  test('Reset title', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.openCountdown(3600);
    await app.selectTitleForEdit();
    await app.saveTitle('Temporary title');
    await app.selectTitleForEdit();
    await app.click('Reset to default');
    await expect(app.headingNamed('Please stand by')).toBeVisible();
    await app.reload();
    await expect(app.headingNamed('Please stand by')).toBeVisible();
  });

  test('Long title', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.openCountdown(3600);
    await app.selectTitleForEdit();
    const longTitle = 'A deliberately long countdown title to check wrapping, clipping, and whether the timer controls remain visible across a typical desktop viewport';
    await app.saveTitle(longTitle);
    const heading = app.headingNamed(longTitle);
    await expect(heading).toBeVisible();
    const titleBox = await heading.boundingBox();
    const bitBox = await app.bits.first().boundingBox();
    expect(titleBox).not.toBeNull();
    expect(bitBox).not.toBeNull();
    expect(titleBox!.y + titleBox!.height).toBeLessThanOrEqual(bitBox!.y);
  });

  test('Empty title', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.openCountdown(3600);
    await app.selectTitleForEdit();
    await app.saveTitle('');
    await expect(app.heading).toHaveText('');
    await expect(app.button('Stop')).toBeVisible();
  });
});