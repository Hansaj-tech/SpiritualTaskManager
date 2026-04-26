/**
 * Aahanik - Spiritual Task Manager
 * 
 * Main page that renders the Aahanik app.
 * The app handles authentication state internally and
 * shows either the login screen or home screen.
 */

import { AahanikApp } from '@/components/aahanik-app'

export default function Home() {
  return <AahanikApp />
}
