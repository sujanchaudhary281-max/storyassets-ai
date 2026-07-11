'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // In production, you could log to an error tracking service here
    // e.g., Sentry.captureException(error, { extra: errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="max-w-md w-full shadow-[var(--shadow-lg)]">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-[var(--error-soft)] flex items-center justify-center">
                  <AlertTriangle size={24} className="text-[var(--error)]" />
                </div>
                <div>
                  <CardTitle className="text-lg">Something went wrong</CardTitle>
                  <p className="text-sm text-[var(--mute)]">An unexpected error occurred</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {this.state.error && (
                <div className="mb-4 p-3 bg-[var(--canvas-soft-2)] rounded-[var(--radius-sm)] text-xs font-mono text-[var(--body)] overflow-auto max-h-32">
                  {this.state.error.message}
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={this.handleReset} className="flex-1 rounded-[var(--radius-pill)]">
                  <RefreshCw size={14} className="mr-2" />
                  Try again
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-[var(--radius-pill)]"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
