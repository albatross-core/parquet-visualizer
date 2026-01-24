# E2E Tests

End-to-end tests using Playwright.

## Running Tests

```bash
# Run all tests
bun run test:e2e

# Run tests in UI mode
bun run test:e2e:ui

# Run tests in headed mode (see browser)
bun run test:e2e:headed
```

## Test Structure

- `app.spec.ts` - Main application tests
- `fixtures/` - Test data files

## Creating Test Data

To enable the full test suite, you need a sample parquet file at `e2e/fixtures/sample.parquet`.

### Option 1: Using Python

```bash
pip install pandas pyarrow

python3 -c "
import pyarrow as pa
import pyarrow.parquet as pq
import pandas as pd

data = {
    'id': list(range(1, 101)),
    'name': [f'User{i}' for i in range(1, 101)],
    'age': [20 + (i % 50) for i in range(1, 101)],
    'email': [f'user{i}@example.com' for i in range(1, 101)],
    'active': [i % 2 == 0 for i in range(1, 101)],
    'score': [50.0 + (i % 50) for i in range(1, 101)]
}

df = pd.DataFrame(data)
table = pa.Table.from_pandas(df)
pq.write_table(table, 'e2e/fixtures/sample.parquet')
"
```

### Option 2: Download Sample File

Download any sample parquet file and place it in `e2e/fixtures/sample.parquet`.

### Option 3: Use Existing Data

If you have parquet files, copy one to `e2e/fixtures/sample.parquet`.

## Notes

- Tests marked with `test.skip()` require a sample parquet file
- Basic UI tests run without any sample data
- Tests run against the built application (uses `bun run preview`)
