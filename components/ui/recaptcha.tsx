"use client";

import React, { useCallback, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Label } from './label';
import { cn } from '@/lib/utils';

interface RecaptchaProps {
  siteKey?: string;
  onChange: (token: string | null) => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  tabIndex?: number;
  className?: string;
  required?: boolean;
  errorMessage?: string | null;
  resetOnError?: boolean;
}

export function Recaptcha({
  siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  onChange,
  theme = 'light',
  size = 'normal',
  tabIndex = 0,
  className,
  required = true,
  errorMessage = null,
  resetOnError = true,
}: RecaptchaProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Reset reCAPTCHA when errorMessage changes from null to a string
  useEffect(() => {
    if (errorMessage && resetOnError && recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  }, [errorMessage, resetOnError]);

  const handleExpired = useCallback(() => {
    onChange(null);
  }, [onChange]);

  // Render error message if provided
  const renderError = () => {
    if (!errorMessage) return null;
    
    return (
      <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
    );
  };

  // Handle case where siteKey is not available - skip reCAPTCHA silently
  if (!siteKey) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {required && (
        <Label htmlFor="recaptcha" className="text-sm text-muted-foreground">
          Please verify you are human
        </Label>
      )}
      <div className="flex justify-start">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          onChange={onChange}
          theme={theme}
          size={size}
          tabindex={tabIndex}
          onExpired={handleExpired}
          onErrored={handleExpired}
        />
      </div>
      {renderError()}
    </div>
  );
} 