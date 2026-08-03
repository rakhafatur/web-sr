import { Component, type ErrorInfo, type ReactNode } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import Button from './Button';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

/** Jaring pengaman terakhir — kalau ada komponen manapun crash saat render,
    tampilkan fallback ini alih-alih layar putih kosong tanpa penjelasan. */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: 24 }}
      >
        <div
          className="text-center"
          style={{ maxWidth: 360 }}
        >
          <div
            className="d-flex align-items-center justify-content-center mx-auto"
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-expense-soft)',
              color: 'var(--color-expense)',
              fontSize: 28,
              marginBottom: 'var(--space-4)',
            }}
          >
            <FiAlertTriangle />
          </div>

          <div
            className="fw-bold"
            style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-dark)', marginBottom: 'var(--space-2)' }}
          >
            Terjadi kesalahan
          </div>

          <div
            style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}
          >
            Maaf, ada yang tidak berjalan semestinya. Coba muat ulang halaman, atau kembali ke Home.
          </div>

          {import.meta.env.DEV && this.state.error && (
            <pre
              className="text-start"
              style={{
                fontSize: 11,
                color: 'var(--color-expense)',
                background: 'var(--color-expense-soft)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {this.state.error.message}
            </pre>
          )}

          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Button
              variant="secondary"
              icon={<FiHome />}
              onClick={() => {
                window.location.href = '/';
              }}
            >
              Kembali ke Home
            </Button>

            <Button
              variant="primary"
              icon={<FiRefreshCw />}
              onClick={() => window.location.reload()}
            >
              Muat Ulang
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
