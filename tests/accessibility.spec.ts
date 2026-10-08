// spec: specs/binary-timer-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { BinaryTimerPage } from './pages/BinaryTimerPage';

test.describe('Accessibility, Themes, and Responsive Layout', () => {
  test('Dark theme', async ({ page }) => {
    const app = new BinaryTimerPage(page);
    await app.emulateColorScheme('dark');
    await app.openSetup();
    await expect(app.root).toHaveCSS('background-color', 'rgb(36, 36, 36)');
    await expect(app.root).toHaveCSS('color', 'rgba(255, 255, 255, 0.87)');

    await app.selectPreset('1m');
    await app.start();
    await expect(page).toHaveURL(/\/binarytimer\/\?time=60$/);
    await expect(app.button('Stop')).toBeVisible();
    await expect(app.root).toHaveCSS('background-color', 'rgb(36, 36, 36)');
  });

  test('Light theme', async ({ page }) => {
    const app = new BinaryTimerPage(page);
    await app.emulateColorScheme('light');
    await app.openSetup();
    await expect(app.root).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.87)');
    await expect(app.root).toHaveCSS('color', 'rgb(36, 36, 36)');
    await app.selectPreset('1m');
    await app.start();
    await expect(page).toHaveURL(/\/binarytimer\/\?time=60$/);
    await expect(app.button('Stop')).toBeVisible();
    await expect(app.root).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.87)');
  });

  test('Theme changes during countdown', async ({ page }) => {
    const app = new BinaryTimerPage(page);
    await app.emulateColorScheme('dark');
    await app.openSetup();
    await app.selectPreset('1m');
    await app.start();
    await expect(page).toHaveURL(/\/binarytimer\/\?time=60$/);
    await expect(app.button('Stop')).toBeVisible();

    await app.emulateColorScheme('light');
    await expect(app.root).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.87)');
    await expect(app.root).toHaveCSS('color', 'rgb(36, 36, 36)');
    await expect(app.button('Stop')).toBeVisible();
    await expect(page).toHaveURL(/\/binarytimer\/\?time=60$/);

    await app.emulateColorScheme('dark');
    await expect(app.root).toHaveCSS('background-color', 'rgb(36, 36, 36)');
    await expect(app.button('Stop')).toBeVisible();
    await expect(page).toHaveURL(/\/binarytimer\/\?time=60$/);
  });

  test('Keyboard setup', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.openSetup();
    await page.keyboard.press('Tab');
    await expect(app.button('Switch to stopwatch mode')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(app.button('Hide optional controls')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(app.button('Mute')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(app.bits.first()).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(app.bits).toHaveCount(8);
    await expect(app.bits.nth(4)).toHaveAttribute('title', '1');
    await expect(app.bits.nth(4)).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(app.button('Start')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/binarytimer\/\?time=8$/);
  });

  test('Keyboard title access', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.openCountdown(60);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    expect.soft(await app.button('Edit title').count()).toBeGreaterThan(0);
  });

  test('Footer links', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    // 1. Inspect footer links using keyboard and accessibility tools.
    await app.openSetup();
    await expect(app.link('Binary Timer')).toHaveAttribute(
      'href',
      'https://github.com/kungfux/binarytimer',
    );
    await expect(app.link('kungfux')).toHaveAttribute('href', 'https://kungfux.github.io/');

    for (let tabPress = 0; tabPress < 16; tabPress += 1) {
      await page.keyboard.press('Tab');
    }
    await expect(app.link('Binary Timer')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(app.link('kungfux')).toBeFocused();
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`Axe ${colorScheme}`, async ({ page }) => {
      const app = new BinaryTimerPage(page);
      await app.emulateColorScheme(colorScheme);

      const runScan = async () =>
        new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();

      await app.openSetup();
      const setupScan = await runScan();

      await app.openCountdown(60);
      const countdownScan = await runScan();

      const violations = [...setupScan.violations, ...countdownScan.violations];
      expect(
        violations.map(({ id, impact, help, nodes }) => ({
          id,
          impact,
          help,
          elements: nodes.map(({ target }) => target),
        })),
      ).toEqual([]);
    });
  }

  for (const viewport of [
    { width: 320, height: 800 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 800 },
  ]) {
    test(`Layout ${viewport.width}px`, async ({ page }) => {
      const app = new BinaryTimerPage(page);
      await app.setViewport(viewport.width, viewport.height);
      await app.openSetup();
      await expect(app.button('Start')).toBeVisible();
      let dimensions = await app.pageDimensions();
      expect.soft(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

      await app.openCountdown(300);
      await expect(app.button('1m')).toBeVisible();
      dimensions = await app.pageDimensions();
      expect.soft(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    });
  }

  test('Layout at 200% zoom', async ({ page }) => {
    const app = new BinaryTimerPage(page);
    await app.setViewport(1280, 800);
    await app.openCountdown(300);
    await app.setZoom('200%');
    await expect(app.button('Stop')).toBeVisible();
    await expect(app.button('1m')).toBeVisible();
    const zoomedDimensions = await app.pageDimensions();
    expect.soft(zoomedDimensions.scrollWidth).toBeLessThanOrEqual(zoomedDimensions.clientWidth);
  });

  test('Reduced motion', async ({ page }) => {
    const app = new BinaryTimerPage(page);
    await app.emulateReducedMotion();
    await app.openSetup(false);
    await app.selectPreset('60m');
    await expect(app.text('1 hour', true)).toBeVisible();
    await app.start();
    await expect(page).toHaveURL(/\/binarytimer\/\?time=3600$/);
    await expect(app.button('Stop')).toBeVisible();
  });

  test('Setup semantics', async ({ page }) => {
    const app = new BinaryTimerPage(page);

    await app.openSetup();
    await expect(app.headingNamed('binary timer')).toBeVisible();
    expect.soft(await page.getByRole('main').count()).toBe(1);
    await expect(app.button('Switch to stopwatch mode')).toBeVisible();
    await expect(app.button('Hide optional controls')).toBeVisible();
    await expect(app.button('Mute')).toBeVisible();

    const setupBits = await app.bits.all();
    const setupNames = await Promise.all(setupBits.map((bit) => bit.getAttribute('aria-label')));
    expect.soft(new Set(setupNames).size).toBe(setupNames.length);
    expect.soft(await setupBits[0].getAttribute('aria-pressed')).toMatch(/true|false/);
  });

  test('Countdown semantics', async ({ page }) => {
    const app = new BinaryTimerPage(page);
    await app.openCountdown(3600);
    await expect(app.headingNamed('Please stand by')).toBeVisible();
    const countdownBits = await app.bits.all();
    const countdownNames = await Promise.all(countdownBits.map((bit) => bit.getAttribute('aria-label')));
    expect.soft(new Set(countdownNames).size).toBe(countdownNames.length);
    await app.selectTitleForEdit();
    await expect(app.titleInput).toBeVisible();
    await expect.soft(app.titleInput).toHaveAccessibleName(/title/i);
    await app.click('Discard');
  });

  test('Stopwatch semantics', async ({ page }) => {
    const app = new BinaryTimerPage(page);
    await app.openCountdown(60);
    await app.stop();
    await app.click('Switch to stopwatch mode');
    await expect(app.text('Press Start to begin')).toBeVisible();
    await expect(app.button('1m')).toHaveCount(0);
    await expect(app.button('Start')).toBeVisible();
  });
});