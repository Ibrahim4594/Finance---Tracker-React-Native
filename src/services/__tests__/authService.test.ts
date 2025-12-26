import { getAuthErrorMessage } from '../authService';

describe('authService', () => {
  describe('getAuthErrorMessage', () => {
    it('should return correct message for email-already-in-use error', () => {
      const message = getAuthErrorMessage('auth/email-already-in-use');
      expect(message).toBe('This email is already registered. Please sign in instead.');
    });

    it('should return correct message for invalid-email error', () => {
      const message = getAuthErrorMessage('auth/invalid-email');
      expect(message).toBe('Invalid email address.');
    });

    it('should return correct message for weak-password error', () => {
      const message = getAuthErrorMessage('auth/weak-password');
      expect(message).toBe('Password is too weak. Please use at least 6 characters.');
    });

    it('should return correct message for user-not-found error', () => {
      const message = getAuthErrorMessage('auth/user-not-found');
      expect(message).toBe('No account found with this email.');
    });

    it('should return correct message for wrong-password error', () => {
      const message = getAuthErrorMessage('auth/wrong-password');
      expect(message).toBe('Incorrect password.');
    });

    it('should return correct message for invalid-credential error', () => {
      const message = getAuthErrorMessage('auth/invalid-credential');
      expect(message).toBe('Invalid email or password.');
    });

    it('should return correct message for too-many-requests error', () => {
      const message = getAuthErrorMessage('auth/too-many-requests');
      expect(message).toBe('Too many failed attempts. Please try again later.');
    });

    it('should return correct message for network-request-failed error', () => {
      const message = getAuthErrorMessage('auth/network-request-failed');
      expect(message).toBe('Network error. Please check your internet connection.');
    });

    it('should return correct message for user-disabled error', () => {
      const message = getAuthErrorMessage('auth/user-disabled');
      expect(message).toBe('This account has been disabled.');
    });

    it('should return correct message for operation-not-allowed error', () => {
      const message = getAuthErrorMessage('auth/operation-not-allowed');
      expect(message).toBe('Email/password accounts are not enabled.');
    });

    it('should return correct message for popup-closed-by-user error', () => {
      const message = getAuthErrorMessage('auth/popup-closed-by-user');
      expect(message).toBe('Sign-in popup was closed before completing.');
    });

    it('should return default message for unknown error codes', () => {
      const message = getAuthErrorMessage('auth/unknown-error');
      expect(message).toBe('An error occurred. Please try again.');
    });

    it('should return default message for empty error code', () => {
      const message = getAuthErrorMessage('');
      expect(message).toBe('An error occurred. Please try again.');
    });

    it('should return default message for non-auth error codes', () => {
      const message = getAuthErrorMessage('some/random/error');
      expect(message).toBe('An error occurred. Please try again.');
    });

    it('should handle all documented Firebase auth error codes', () => {
      const errorCodes = [
        'auth/email-already-in-use',
        'auth/invalid-email',
        'auth/operation-not-allowed',
        'auth/weak-password',
        'auth/user-disabled',
        'auth/user-not-found',
        'auth/wrong-password',
        'auth/invalid-credential',
        'auth/too-many-requests',
        'auth/network-request-failed',
        'auth/popup-closed-by-user',
      ];

      errorCodes.forEach((code) => {
        const message = getAuthErrorMessage(code);
        expect(message).toBeTruthy();
        expect(message.length).toBeGreaterThan(0);
        expect(message).not.toBe('An error occurred. Please try again.');
      });
    });
  });
});
