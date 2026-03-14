import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <nav data-testid="pagination" className="flex items-center justify-center gap-1 mt-8">
      <button
        data-testid="pagination-previous"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center justify-center w-9 h-9 rounded-full text-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-bg-secondary transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {getPageNumbers().map((page, index) =>
        typeof page === 'string' ? (
          <span key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center text-text-secondary text-sm">
            ...
          </span>
        ) : (
          <button
            key={page}
            data-testid={`pagination-page-${page}`}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-text text-bg'
                : 'text-text hover:bg-bg-secondary'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        data-testid="pagination-next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-full text-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-bg-secondary transition-colors"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  )
}
