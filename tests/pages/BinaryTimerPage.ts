import { expect, type Locator, type Page } from '@playwright/test';

const APP_URL = 'http://localhost:5173';
const STABLE_APP_STYLES = `
  .typewriter::before {
    animation: none !important;
    content: "binary timer" !important;
  }
  .typewriter::after,
  [class*="entering"],
  [class*="leaving"] {
    animation: none !important;
  }
  button {
    transition: none !important;
  }
`;

export class BinaryTimerPage {
  constructor(readonly page: Page) {}

  get root(): Locator {
    return this.page.locator('html');
  }

  get heading(): Locator {
    return this.page.locator('h1');
  }

  get bits(): Locator {
    return this.page.getByRole('button', { name: /^bit-\d+$/ });
  }

  get selectedBits(): Locator {
    return this.page.locator('button[title="1"]');
  }

  get summary(): Locator {
    return this.page.locator('p').first();
  }

  get titleInput(): Locator {
    return this.page.getByRole('textbox');
  }

  button(name: string, exact = true): Locator {
    return this.page.getByRole('button', { name, exact });
  }

  headingNamed(name: string): Locator {
    return this.page.getByRole('heading', { name });
  }

  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  text(content: string, exact = false): Locator {
    return this.page.getByText(content, { exact });
  }

  link(name: string): Locator {
    return this.page.getByRole('link', { name, exact: true });
  }

  audio(id: 'bee' | 'doo'): Locator {
    return this.page.locator(`#${id}`);
  }

  async open(path: string, stabilize = true): Promise<void> {
    await this.page.goto(`${APP_URL}${path}`);
    if (stabilize) {
      await this.stabilizeAnimations();
    }
  }

  async openSetup(stabilize = true): Promise<void> {
    await this.open('/binarytimer/', stabilize);
    await expect(this.heading).toBeVisible();
    await expect(this.button('Start')).toBeVisible();
  }

  async openCountdown(seconds: number, stabilize = true): Promise<void> {
    await this.open(`/binarytimer/?time=${seconds}`, stabilize);
    await expect(this.button('Stop')).toBeVisible();
  }

  async reload(stabilize = true): Promise<void> {
    await this.page.reload();
    if (stabilize) {
      await this.stabilizeAnimations();
    }
  }

  async selectPreset(label: string): Promise<void> {
    const preset = this.button(label);
    await expect(preset).toBeVisible();
    await preset.click({ force: true });
  }

  async click(name: string): Promise<void> {
    const control = this.button(name);
    await expect(control).toBeVisible();
    await control.click({ force: true });
  }

  async start(): Promise<void> {
    const startButton = this.button('Start');
    await expect(startButton).toBeEnabled();
    await startButton.click({ force: true });
  }

  async stop(): Promise<void> {
    const stopButton = this.button('Stop');
    await expect(stopButton).toBeVisible();
    await stopButton.click({ force: true });
  }

  async toggleBit(index: number): Promise<void> {
    const bit = this.bits.nth(index);
    await expect(bit).toBeVisible();
    await bit.click({ force: true });
  }

  async selectTitleForEdit(): Promise<void> {
    await this.heading.hover();
    await this.click('Edit title');
  }

  async saveTitle(value: string): Promise<void> {
    await this.titleInput.fill(value);
    await this.click('Accept');
  }

  async emulateColorScheme(colorScheme: 'dark' | 'light'): Promise<void> {
    await this.page.emulateMedia({ colorScheme });
  }

  async emulateReducedMotion(): Promise<void> {
    await this.page.emulateMedia({ reducedMotion: 'reduce' });
  }

  async freezeTime(): Promise<void> {
    await this.page.clock.install();
  }

  async mockAudioPlayback(behavior: 'reject' | 'pending'): Promise<void> {
    await this.page.addInitScript((playBehavior) => {
      HTMLMediaElement.prototype.play = () =>
        playBehavior === 'reject'
          ? Promise.reject<void>(new Error('Autoplay blocked'))
          : new Promise<void>(() => {});
    }, behavior);
  }

  async setViewport(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }

  async setZoom(zoom: string): Promise<void> {
    await this.root.evaluate((element, value) => {
      (element as HTMLElement).style.zoom = value;
    }, zoom);
  }

  async pageDimensions(): Promise<{ clientWidth: number; scrollWidth: number }> {
    return this.root.evaluate((element) => ({
      clientWidth: (element as HTMLElement).clientWidth,
      scrollWidth: (element as HTMLElement).scrollWidth,
    }));
  }

  async bitValue(): Promise<number> {
    const bitValues = await Promise.all(
      (await this.bits.all()).map(async (bit) => ({
        index: Number((await bit.getAttribute('aria-label'))?.match(/^bit-(\d+)$/)?.[1]),
        value: Number(await bit.getAttribute('title')),
      })),
    );
    return bitValues.reduce((total, bit) => total + bit.value * 2 ** bit.index, 0);
  }

  async stabilizeAnimations(): Promise<void> {
    await this.page.addStyleTag({ content: STABLE_APP_STYLES });
  }
}
