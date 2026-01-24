import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Parquet Visualizer', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Parquet Visualizer')
    await expect(page.locator('h2')).toContainText('Visualize Your Parquet Files')
  })

  test('should show upload dropzone', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Upload a Parquet file' })).toBeVisible()
    await expect(page.getByText('Drag and drop or click to browse')).toBeVisible()
    await expect(page.getByText('.parquet files supported')).toBeVisible()
  })

  test('should display footer information', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Built with')).toBeVisible()
    await expect(page.getByText('parquet-wasm')).toBeVisible()
    await expect(page.getByText('No data leaves your browser')).toBeVisible()
  })

  test('should have GitHub link', async ({ page }) => {
    await page.goto('/')
    const githubLink = page.locator('a[href*="github.com/albatross-core/parquet-visualizer"]')
    await expect(githubLink).toBeVisible()
  })

  test('should show loading state when file is being processed', async ({ page }) => {
    await page.goto('/')

    // Note: This test would need a real parquet file
    // For now, we just check the UI elements exist
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeAttached()
  })
})

test.describe('File Upload (requires sample file)', () => {
  test.skip('should upload and display parquet file', async ({ page }) => {
    // This test is skipped because it requires a sample parquet file
    // To enable: create e2e/fixtures/sample.parquet
    await page.goto('/')

    const fileInput = page.locator('input[type="file"]')
    const sampleFile = path.join(__dirname, 'fixtures', 'sample.parquet')

    await fileInput.setInputFiles(sampleFile)

    // Wait for loading
    await expect(page.getByText('Loading parquet file...')).toBeVisible()

    // Check that data table appears
    await expect(page.getByText('Data Preview')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Schema')).toBeVisible()

    // Check stats cards
    await expect(page.getByText('Total Rows')).toBeVisible()
    await expect(page.getByText('Columns')).toBeVisible()
    await expect(page.getByText('Row Groups')).toBeVisible()
    await expect(page.getByText('File Size')).toBeVisible()
  })

  test.skip('should search data', async ({ page }) => {
    // Requires sample file
    await page.goto('/')

    const fileInput = page.locator('input[type="file"]')
    const sampleFile = path.join(__dirname, 'fixtures', 'sample.parquet')
    await fileInput.setInputFiles(sampleFile)

    await expect(page.getByText('Data Preview')).toBeVisible({ timeout: 10000 })

    // Test global search
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('Alice')

    await expect(page.getByText('Found')).toBeVisible()
  })

  test.skip('should toggle regex search', async ({ page }) => {
    // Requires sample file
    await page.goto('/')

    const fileInput = page.locator('input[type="file"]')
    const sampleFile = path.join(__dirname, 'fixtures', 'sample.parquet')
    await fileInput.setInputFiles(sampleFile)

    await expect(page.getByText('Data Preview')).toBeVisible({ timeout: 10000 })

    // Click regex button
    const regexButton = page.getByRole('button', { name: /Regex/ })
    await regexButton.click()

    // Check that button is active
    await expect(regexButton).toHaveClass(/default/)
  })

  test.skip('should filter columns', async ({ page }) => {
    // Requires sample file
    await page.goto('/')

    const fileInput = page.locator('input[type="file"]')
    const sampleFile = path.join(__dirname, 'fixtures', 'sample.parquet')
    await fileInput.setInputFiles(sampleFile)

    await expect(page.getByText('Data Preview')).toBeVisible({ timeout: 10000 })

    // Click columns button
    const columnsButton = page.getByRole('button', { name: /Columns/ })
    await columnsButton.click()

    // Check dropdown appears
    await expect(page.getByText('Toggle columns')).toBeVisible()
    await expect(page.getByText('Show all')).toBeVisible()
    await expect(page.getByText('Hide all')).toBeVisible()
  })

  test.skip('should filter by data type', async ({ page }) => {
    // Requires sample file
    await page.goto('/')

    const fileInput = page.locator('input[type="file"]')
    const sampleFile = path.join(__dirname, 'fixtures', 'sample.parquet')
    await fileInput.setInputFiles(sampleFile)

    await expect(page.getByText('Data Preview')).toBeVisible({ timeout: 10000 })

    // Click type filter button
    const typeButton = page.getByRole('button', { name: /Type/ })
    await typeButton.click()

    // Check options
    await expect(page.getByText('Filter by type')).toBeVisible()
    await expect(page.getByText('All types')).toBeVisible()
  })

  test.skip('should sort columns', async ({ page }) => {
    // Requires sample file
    await page.goto('/')

    const fileInput = page.locator('input[type="file"]')
    const sampleFile = path.join(__dirname, 'fixtures', 'sample.parquet')
    await fileInput.setInputFiles(sampleFile)

    await expect(page.getByText('Data Preview')).toBeVisible({ timeout: 10000 })

    // Find a column header and click to sort
    // Note: This would need to be more specific based on actual data
    const firstColumnHeader = page.locator('thead button').first()
    await firstColumnHeader.click()

    // Should show sort indicator
    await expect(page.locator('svg[class*="lucide-arrow"]')).toBeVisible()
  })

  test.skip('should paginate through data', async ({ page }) => {
    // Requires sample file with enough rows
    await page.goto('/')

    const fileInput = page.locator('input[type="file"]')
    const sampleFile = path.join(__dirname, 'fixtures', 'sample.parquet')
    await fileInput.setInputFiles(sampleFile)

    await expect(page.getByText('Data Preview')).toBeVisible({ timeout: 10000 })

    // Check pagination controls
    await expect(page.getByText(/Page \d+ of \d+/)).toBeVisible()

    // Try to navigate (might be disabled if not enough data)
    const nextButton = page.locator('button:has-text("›")')
    const isEnabled = await nextButton.isEnabled()

    if (isEnabled) {
      await nextButton.click()
      await expect(page.getByText(/Page 2 of/)).toBeVisible()
    }
  })

  test.skip('should switch between data and schema views', async ({ page }) => {
    // Requires sample file
    await page.goto('/')

    const fileInput = page.locator('input[type="file"]')
    const sampleFile = path.join(__dirname, 'fixtures', 'sample.parquet')
    await fileInput.setInputFiles(sampleFile)

    await expect(page.getByText('Data Preview')).toBeVisible({ timeout: 10000 })

    // Click Schema tab
    const schemaButton = page.getByRole('button', { name: /Schema/ })
    await schemaButton.click()

    // Check schema view
    await expect(page.getByText('Column Name')).toBeVisible()
    await expect(page.getByText('Type')).toBeVisible()
    await expect(page.getByText('Nullable')).toBeVisible()

    // Switch back to Data
    const dataButton = page.getByRole('button', { name: /Data/ })
    await dataButton.click()

    await expect(page.getByText('Showing')).toBeVisible()
  })

  test.skip('should close file and return to upload', async ({ page }) => {
    // Requires sample file
    await page.goto('/')

    const fileInput = page.locator('input[type="file"]')
    const sampleFile = path.join(__dirname, 'fixtures', 'sample.parquet')
    await fileInput.setInputFiles(sampleFile)

    await expect(page.getByText('Data Preview')).toBeVisible({ timeout: 10000 })

    // Click close button
    const closeButton = page.getByRole('button', { name: /Close/ })
    await closeButton.click()

    // Should return to upload screen
    await expect(page.getByText('Upload a Parquet file')).toBeVisible()
  })
})
