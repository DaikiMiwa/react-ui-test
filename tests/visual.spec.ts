import { expect, test } from '@playwright/test'

const routes = [
  { name: 'home', path: '/' },
  { name: 'workout', path: '/workout' },
  { name: 'meal', path: '/meal' },
  { name: 'calendar', path: '/calendar' },
  { name: 'data-review', path: '/data-review' },
  { name: 'chat', path: '/chat' },
  { name: 'settings', path: '/settings' },
]

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const fixedNow = new Date('2026-05-11T09:00:00+09:00').valueOf()
    const RealDate = Date

    class FixedDate extends RealDate {
      constructor(...args: ConstructorParameters<typeof Date>) {
        super(...(args.length === 0 ? [fixedNow] : args))
      }

      static now() {
        return fixedNow
      }
    }

    window.Date = FixedDate as DateConstructor
  })
})

for (const route of routes) {
  test(`${route.name} visual`, async ({ page }, testInfo) => {
    await page.goto(`/#${route.path}`)
    await page.locator('body').waitFor({ state: 'visible' })
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible()
    await expect(page).toHaveScreenshot(`${testInfo.project.name}-${route.name}.png`, {
      animations: 'disabled',
      fullPage: true,
      maxDiffPixelRatio: 0.01,
      stylePath: 'tests/visual-stabilize.css',
    })
  })
}
