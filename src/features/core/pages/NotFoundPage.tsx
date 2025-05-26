function NotFoundPage() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-4 text-danger">404</h1>
      <p className="lead">Halaman tidak ditemukan.</p>
      <p className="text-muted">Cek kembali URL atau kembali ke <a href="/">beranda</a>.</p>
    </div>
  );
}

export default NotFoundPage;