import { Component } from 'react'

/**
 * Fanger render-feil i komponent-treet og viser en nyttig feilmelding
 * i stedet for blank side. Uten denne ville ethvert ukjent krasj under
 * rendering demontere hele React-treet (blank hvit side for brukeren).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { harFeil: false, feilmelding: '' }
  }

  static getDerivedStateFromError(error) {
    return { harFeil: true, feilmelding: error?.message || 'Ukjent feil' }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Render-feil:', error, info?.componentStack)
  }

  render() {
    if (this.state.harFeil) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60vh', padding: '40px 20px',
          textAlign: 'center', gap: '16px'
        }}>
          <div style={{ fontSize: '2rem' }}>⚠️</div>
          <h2 style={{ margin: 0, color: '#1e293b', fontWeight: 700 }}>Noe gikk galt</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '15px', maxWidth: '400px' }}>
            En uventet feil oppstod. Last siden på nytt for å prøve igjen.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#4338ca', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '10px 24px', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer'
            }}
          >
            Last siden på nytt
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre style={{
              marginTop: '12px', padding: '12px', background: '#f8fafc',
              border: '1px solid #e2e8f0', borderRadius: '6px',
              fontSize: '12px', color: '#ef4444', textAlign: 'left',
              maxWidth: '600px', overflow: 'auto'
            }}>
              {this.state.feilmelding}
            </pre>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
