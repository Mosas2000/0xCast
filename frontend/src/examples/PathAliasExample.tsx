/**
 * Path Alias Usage Example
 * 
 * This file demonstrates the correct usage of @ path aliases
 * throughout the application.
 */

// ✅ Correct: Using @ path alias
import { RateLimitService } from '@/services/RateLimitService';
import { RateLimitAction } from '@/types/rateLimit';
import { useRateLimit } from '@/hooks/useRateLimit';

// ❌ Avoid: Relative paths for deep imports
// import { RateLimitService } from '../../../services/RateLimitService';

export function PathAliasExample() {
  // Example usage
  const { status } = useRateLimit('user-123', 'market-creation' as RateLimitAction);
  
  return (
    <div>
      <h2>Path Alias Example</h2>
      <p>This component demonstrates @ path alias usage</p>
      <pre>
        {`import { Service } from '@/services/Service';
import { Type } from '@/types/Type';
import { useHook } from '@/hooks/useHook';`}
      </pre>
    </div>
  );
}
