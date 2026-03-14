import './Pagination.css'

interface PaginationProps {
  page: number
  totalPages: number
  loading: boolean
  onLoadMore: () => void
}

function Pagination({ page, totalPages, loading, onLoadMore }: PaginationProps) {
  if (page >= totalPages) {
    return null
  }

  return (
    <div className="pagination" data-testid="pagination">
      <button
        className="pagination__button"
        onClick={onLoadMore}
        disabled={loading}
        data-testid="pagination-load-more"
      >
        {loading ? (
          <span className="pagination__loading" data-testid="pagination-loading">
            <span className="pagination__spinner" />
            Loading...
          </span>
        ) : (
          'Load more results'
        )}
      </button>
    </div>
  )
}

export default Pagination
