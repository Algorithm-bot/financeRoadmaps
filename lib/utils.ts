import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import parse from 'html-react-parser'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes HTML content and returns React elements
 * @param html - The HTML string to sanitize and parse
 * @returns React elements or null if no content
 */
export function sanitizeAndParseHTML(html: string | undefined | null): React.ReactNode {
  if (!html) return null
  
  // Basic sanitization that works with SSR
  // Remove potentially dangerous content
  let cleanHTML = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:/gi, '') // Remove data: URLs for security
    .replace(/vbscript:/gi, '') // Remove vbscript: URLs
  
  return parse(cleanHTML)
}

