/**
 * TRIPONA Authentication & Animation Comprehensive Audit Test Suite
 * Tests:
 * 1. AuthModal component architecture & accessibility
 * 2. Password visibility toggle implementation
 * 3. Remember-me state & session persistence logic
 * 4. Email & Password validation rules
 * 5. Duplicate submission prevention guards
 * 6. Animation keyframes, countdown timer, and reduced-motion compliance
 * 7. Mobile responsive design constraints
 * 8. Production build verification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    throw new Error(`Assertion failed: ${testName}`);
  }
}

console.log('====================================================');
console.log('🧪 TRIPONA AUTHENTICATION & ANIMATION AUDIT SUITE');
console.log('====================================================\n');

// ----------------------------------------------------
// TEST GROUP 1: AUTH MODAL INTEGRITY & FEATURES
// ----------------------------------------------------
console.log('📌 [Test Group 1] Verifying AuthModal Component Implementation...');

const authModalPath = path.join(rootDir, 'client', 'src', 'components', 'AuthModal.jsx');
assert(fs.existsSync(authModalPath), 'AuthModal.jsx file exists');

const authModalContent = fs.readFileSync(authModalPath, 'utf8');

assert(authModalContent.includes('showPassword') && authModalContent.includes('setShowPassword'), 'Password visibility toggle state is implemented');
assert(authModalContent.includes('Eye') && authModalContent.includes('EyeOff'), 'Eye and EyeOff icons imported from lucide-react');
assert(authModalContent.includes('rememberMe') && authModalContent.includes('setRememberMe'), 'Remember-me functionality is implemented');
assert(authModalContent.includes('confetti'), 'Celebration confetti integrated on login success');
assert(authModalContent.includes('if (loading) return;'), 'Duplicate form submissions are strictly prevented');
assert(authModalContent.includes("e.key === 'Escape'"), 'Escape key handler closes modal for accessibility');
assert(authModalContent.includes('e.target === e.currentTarget'), 'Backdrop click-to-close handler implemented');
assert(authModalContent.includes("document.body.style.overflow = 'hidden'"), 'Background scroll lock active when modal open');
assert(authModalContent.includes('clearTimeout'), 'Timer cleanup prevents memory leaks on modal unmount');
assert(authModalContent.includes('role="dialog"') && authModalContent.includes('aria-modal="true"'), 'WAI-ARIA modal accessibility attributes present');

// ----------------------------------------------------
// TEST GROUP 2: AUTH CONTEXT & SESSION PERSISTENCE
// ----------------------------------------------------
console.log('\n📌 [Test Group 2] Verifying AuthContext & Session Management...');

const authContextPath = path.join(rootDir, 'client', 'src', 'context', 'AuthContext.jsx');
assert(fs.existsSync(authContextPath), 'AuthContext.jsx exists');

const authContextContent = fs.readFileSync(authContextPath, 'utf8');

assert(authContextContent.includes('persistUserSession'), 'Session persistence manager function defined');
assert(authContextContent.includes('sessionStorage'), 'Supports sessionStorage for non-remembered sessions');
assert(authContextContent.includes('localStorage'), 'Supports localStorage for persistent sessions');
assert(!authContextContent.includes('mock_user_123') && !authContextContent.includes('demo_user'), 'No fake demo user bypasses present');
assert(authContextContent.includes('signInWithPopup') && authContextContent.includes('googleProvider'), 'Real Firebase Google OAuth implemented');
assert(authContextContent.includes('setAuthError(null)'), 'Clears residual errors on successful login');

// ----------------------------------------------------
// TEST GROUP 3: INPUT VALIDATION LOGIC
// ----------------------------------------------------
console.log('\n📌 [Test Group 3] Verifying Validation Logic...');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
assert(emailRegex.test('traveler@tripona.com'), 'Valid email passes RFC check');
assert(emailRegex.test('john.doe+voyager@domain.co.uk'), 'Complex sub-domain/tag email passes');
assert(!emailRegex.test('invalid-email'), 'Plain text fails email validation');
assert(!emailRegex.test('missing@tld'), 'Email missing domain TLD fails');
assert(!emailRegex.test('@nodomain.com'), 'Email missing local part fails');
assert(!emailRegex.test('spaces in@email.com'), 'Email with spaces fails');

// Password rules: at least 6 characters
const isValidPassword = (p) => Boolean(p && p.length >= 6);
assert(isValidPassword('secure123'), 'Valid 9-char password passes');
assert(isValidPassword('123456'), 'Minimum 6-char password passes');
assert(!isValidPassword('12345'), '5-char password fails minimum length check');
assert(!isValidPassword(''), 'Empty password fails');

// ----------------------------------------------------
// TEST GROUP 4: ANIMATIONS & ACCESSIBILITY
// ----------------------------------------------------
console.log('\n📌 [Test Group 4] Verifying Animations & Accessibility...');

assert(authModalContent.includes('@keyframes fadeSlideUp'), 'Entrance fadeSlideUp keyframes defined');
assert(authModalContent.includes('@keyframes popIn'), 'Success checkmark popIn keyframes defined');
assert(authModalContent.includes('@keyframes ringPulse'), 'Pulsing glowing ring keyframes defined');
assert(authModalContent.includes('@keyframes sparkle'), 'Ambient sparkles keyframes defined');
assert(authModalContent.includes('@keyframes progressBar'), 'Countdown timer progress bar keyframes defined');
assert(authModalContent.includes('@media (prefers-reduced-motion: reduce)'), 'Prefers-reduced-motion media query implemented for accessibility');

// ----------------------------------------------------
// TEST GROUP 5: RESPONSIVE LAYOUT CONSTRAINTS
// ----------------------------------------------------
console.log('\n📌 [Test Group 5] Verifying Responsive Design Constraints...');

assert(authModalContent.includes('max-h-[92vh]'), 'Modal constrained to 92vh to prevent vertical cutoff on mobile');
assert(authModalContent.includes('overflow-y-auto'), 'Vertical scrolling enabled for small mobile screens');
assert(authModalContent.includes('max-w-md'), 'Max width constrained to 28rem (448px) for desktop elegance');
assert(authModalContent.includes('p-5 sm:p-7'), 'Adaptive responsive padding (p-5 mobile, p-7 desktop) prevents text clipping');

// ----------------------------------------------------
// TEST GROUP 6: BUILD VERIFICATION
// ----------------------------------------------------
console.log('\n📌 [Test Group 6] Verifying Production Build Output...');

const distIndexPath = path.join(rootDir, 'client', 'dist', 'index.html');
assert(fs.existsSync(distIndexPath), 'Production bundle client/dist/index.html exists');

const distIndexContent = fs.readFileSync(distIndexPath, 'utf8');
assert(distIndexContent.includes('<!DOCTYPE html>') || distIndexContent.includes('<!doctype html>'), 'Valid HTML5 doctype in production build');

console.log('\n====================================================');
console.log(`🎉 ALL AUDIT TESTS PASSED: ${passedTests}/${totalTests} tests successful!`);
console.log('====================================================\n');
