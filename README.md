# result-tuple

![test workflow](https://github.com/rajithaeyee/result-tuple/actions/workflows/test.yml/badge.svg)

<div align="center">
  
[![npm version](https://img.shields.io/badge/npm-v1.0.0-blue.svg)](https://www.npmjs.com/package/result-tuple)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)](https://www.typescriptlang.org/)
  
</div>

A lightweight, zero-dependency TypeScript library that implements the `[result, error]` pattern, inspired by Go's approach to error handling.

```typescript
// Instead of traditional try/catch blocks:
const [data, error] = fetchData();

if (error) {
  // Handle error
} else {
  // Use data safely
}
```

## Features

- **Fully type-safe** with complete TypeScript support
- **Sync and async** function support
- **Zero dependencies** and lightweight as hell
- **Simple, intuitive API** and easy to adopt
- **Well-tested** with 100% test coverage

## Installation

```bash
# Using npm
npm install result-tuple

# Using yarn
yarn add result-tuple

# Using pnpm
pnpm add result-tuple
```

## Usage

### Basic usage:

```typescript
import { wrapFunction } from 'result-tuple';

// Your original function that might throw
function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}

// Wrap it to return [result, error]
const safeDivide = wrapFunction(divide);

// Use the wrapped function
const [result, error] = safeDivide(10, 2);

if (error) {
  console.error('Error:', error.message);
} else {
  console.log('Result:', result); // Output: Result: 5
}
```

### Handling async functions:

```typescript
import { wrapAsyncFunction } from 'result-tuple';

// An async function that might throw
async function fetchUserData(id: string) {
  const response = await fetch(`https://api.example.com/users/${id}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

// Wrap it
const safeFetchUserData = wrapAsyncFunction(fetchUserData);

// Use it with async/await
async function getUserInfo(userId: string) {
  const [userData, error] = await safeFetchUserData(userId);
  
  if (error) {
    console.error('Failed to fetch user data:', error.message);
    return null;
  }
  
  return userData;
}
```

## API Reference with Examples

### Core Functions

#### `wrapFunction<T, Args extends any[]>(fn: (...args: Args) => T): (...args: Args) => ResultTuple<T>`

Wraps a synchronous function to return a `[result, error]` tuple.

```typescript
import { wrapFunction } from 'result-tuple';

const parseJSON = wrapFunction(JSON.parse);
const [data, error] = parseJSON('{"name": "John"}');
```

#### `wrapAsyncFunction<T, Args extends any[]>(fn: (...args: Args) => Promise<T>): (...args: Args) => Promise<ResultTuple<T>>`

Wraps an asynchronous function to return a Promise resolving to a `[result, error]` tuple.

```typescript
import { wrapAsyncFunction } from 'result-tuple';

const fetchData = wrapAsyncFunction(async (url) => {
  const res = await fetch(url);
  return await res.json();
});

// Later in async code:
const [data, error] = await fetchData('https://api.example.com/data');
```

#### `attempt<T>(fn: () => T): ResultTuple<T>`

For one-off operations that might throw.

```typescript
import { attempt } from 'result-tuple';

// Parse JSON safely
const [parsedData, parseError] = attempt(() => JSON.parse(jsonString));

// Access DOM safely
const [element, domError] = attempt(() => document.querySelector('#non-existent'));
```

#### `attemptAsync<T>(fn: () => Promise<T>): Promise<ResultTuple<T>>`

For one-off async operations.

```typescript
import { attemptAsync } from 'result-tuple';

const [result, error] = await attemptAsync(async () => {
  const response = await fetch('https://api.example.com/data');
  return await response.json();
});
```

### Utility Functions

#### `ok<T>(value: T): [T, null]`

Creates a success result tuple.

```typescript
import { ok } from 'result-tuple';

function findUser(id: string) {
  const user = userDatabase.get(id);
  return user ? ok(user) : fail(new Error('User not found'));
}
```

#### `fail<T>(error: Error | string): [null, Error]`

Creates an error result tuple.

```typescript
import { fail } from 'result-tuple';

function validateEmail(email: string) {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return isValid ? ok(true) : fail('Invalid email format');
}
```

### Types

#### `ResultTuple<T>`

The main type returned by wrapped functions.

```typescript
type ResultTuple<T> = [T, null] | [null, Error];
```

## Examples

### Form validation

```typescript
import { wrapFunction, ok, fail } from 'result-tuple';

const validateForm = (formData: any) => {
  if (!formData.email) {
    return fail('Email is required');
  }
  
  if (!formData.password || formData.password.length < 8) {
    return fail('Password must be at least 8 characters');
  }
  
  return ok(formData);
};

const safeValidateForm = wrapFunction(validateForm);

function handleSubmit(formData: any) {
  const [validData, validationError] = safeValidateForm(formData);
  
  if (validationError) {
    showErrorMessage(validationError.message);
    return;
  }
  
  submitToServer(validData);
}
```

### Database operations

```typescript
import { wrapAsyncFunction } from 'result-tuple';

const db = {
  async findUser(id: string) {
    // Database query that might throw
    if (id === 'invalid') throw new Error('User not found');
    return { id, name: 'John Doe' };
  }
};

const safeFindUser = wrapAsyncFunction(db.findUser);

async function getUserProfile(userId: string) {
  const [user, dbError] = await safeFindUser(userId);
  
  if (dbError) {
    logError(dbError);
    return { error: 'Failed to fetch user profile' };
  }
  
  return { profile: user };
}
```

### Sequential operations with error handling

```typescript
import { wrapAsyncFunction } from 'result-tuple';

const fetchUserData = wrapAsyncFunction(async (id: string) => {
  // API call
});

const processUserData = wrapAsyncFunction(async (userData: any) => {
  // Complex processing
});

const saveUserReport = wrapAsyncFunction(async (processedData: any) => {
  // Save to database
});

async function generateUserReport(userId: string) {
  // Step 1: Fetch user data
  const [userData, fetchError] = await fetchUserData(userId);
  if (fetchError) return { error: `Fetch error: ${fetchError.message}` };
  
  // Step 2: Process the data
  const [processedData, processError] = await processUserData(userData);
  if (processError) return { error: `Processing error: ${processError.message}` };
  
  // Step 3: Save the report
  const [report, saveError] = await saveUserReport(processedData);
  if (saveError) return { error: `Save error: ${saveError.message}` };
  
  return { success: true, reportId: report.id };
}
```

## Why use the Result pattern?

1. **Better readability** - Clear separation between happy path and error handling
2. **Explicit error handling** - Forces you to consider error cases
3. **Type safety** - Full type checking for both successful and error results
4. **Predictable API** - Consistent pattern across your codebase
5. **No try/catch blocks** - Cleaner code without nested try/catch


## Comparison with other approaches

| Approach | Pros | Cons |
|----------|------|------|
| **try/catch** | Built into language | Can be verbose, easy to forget |
| **Promises with .catch()** | Good for async | Harder to type correctly |
| **Optional returns** | Simple | Doesn't include error information |
| **Result pattern** | Explicit, type-safe | Requires wrapping functions |

## Contributing

Contributions are welcome! Please feel free to add a PR.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Special Thanks Goes To

- Go's error handling pattern
- TS team for the amazing type system <3

---
