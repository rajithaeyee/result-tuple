import { wrapFunction, wrapAsyncFunction, attempt, attemptAsync, ok, fail } from '../index';

describe('Result-Error Pattern Library', () => {
  describe('wrapFunction', () => {
    test('should return [result, null] on success', () => {
      const add = (a: number, b: number) => a + b;
      const safeAdd = wrapFunction(add);
      
      const [result, error] = safeAdd(2, 3);
      expect(result).toBe(5);
      expect(error).toBeNull();
    });
    
    test('should return [null, error] on failure', () => {
      const divide = (a: number, b: number) => {
        if (b === 0) throw new Error('Division by zero');
        return a / b;
      };
      const safeDivide = wrapFunction(divide);
      
      const [result, error] = safeDivide(10, 0);
      expect(result).toBeNull();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('Division by zero');
    });
  });
  
  describe('wrapAsyncFunction', () => {
    test('should return [result, null] on success', async () => {
      const fetchData = async (id: string) => ({ id, name: 'Test' });
      const safeFetch = wrapAsyncFunction(fetchData);
      
      const [result, error] = await safeFetch('123');
      expect(result).toEqual({ id: '123', name: 'Test' });
      expect(error).toBeNull();
    });
    
    test('should return [null, error] on failure', async () => {
      const fetchData = async (id: string) => {
        throw new Error('Network error');
      };
      const safeFetch = wrapAsyncFunction(fetchData);
      
      const [result, error] = await safeFetch('123');
      expect(result).toBeNull();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('Network error');
    });
  });
  
  describe('attempt', () => {
    test('should return [result, null] on success', () => {
      const [result, error] = attempt(() => JSON.parse('{"name":"John"}'));
      expect(result).toEqual({ name: 'John' });
      expect(error).toBeNull();
    });
    
    test('should return [null, error] on failure', () => {
      const [result, error] = attempt(() => JSON.parse('{invalid}'));
      expect(result).toBeNull();
      expect(error).toBeInstanceOf(Error);
    });
  });
  
  describe('attemptAsync', () => {
    test('should return [result, null] on success', async () => {
      const [result, error] = await attemptAsync(async () => 'success');
      expect(result).toBe('success');
      expect(error).toBeNull();
    });
    
    test('should return [null, error] on failure', async () => {
      const [result, error] = await attemptAsync(async () => {
        throw new Error('Async error');
      });
      expect(result).toBeNull();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('Async error');
    });
  });
  
  describe('ok and fail', () => {
    test('ok should create a success tuple', () => {
      const result = ok(42);
      expect(result).toEqual([42, null]);
    });
    
    test('fail should create an error tuple', () => {
      const error = new Error('Test error');
      const result = fail(error);
      expect(result).toEqual([null, error]);
    });
    
    test('fail should handle string errors', () => {
      const result = fail('Test error');
      expect(result[0]).toBeNull();
      expect(result[1]).toBeInstanceOf(Error);
      expect(result[1]?.message).toBe('Test error');
    });
  });
});