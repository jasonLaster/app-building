import { useDispatch } from 'react-redux';
import { clearCompleted } from '../slices/todosSlice';
import type { Todo } from '../slices/todosSlice';
import type { AppDispatch } from '../store';
import './Filters.css';

export type FilterType = 'all' | 'active' | 'completed';

interface FiltersProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  todos: Todo[];
}

export default function Filters({ filter, onFilterChange, todos }: FiltersProps) {
  const dispatch = useDispatch<AppDispatch>();

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="filters" data-testid="filters">
      <span className="filters-count" data-testid="items-left">
        {activeCount} {activeCount === 1 ? 'item' : 'items'} left
      </span>
      <div className="filters-buttons" data-testid="filter-buttons">
        <button
          className={`filters-btn ${filter === 'all' ? 'filters-btn--active' : ''}`}
          data-testid="filter-all"
          onClick={() => onFilterChange('all')}
        >
          All
        </button>
        <button
          className={`filters-btn ${filter === 'active' ? 'filters-btn--active' : ''}`}
          data-testid="filter-active"
          onClick={() => onFilterChange('active')}
        >
          Active
        </button>
        <button
          className={`filters-btn ${filter === 'completed' ? 'filters-btn--active' : ''}`}
          data-testid="filter-completed"
          onClick={() => onFilterChange('completed')}
        >
          Completed
        </button>
      </div>
      {completedCount > 0 && (
        <button
          className="filters-clear"
          data-testid="clear-completed"
          onClick={() => dispatch(clearCompleted())}
        >
          Clear completed
        </button>
      )}
    </div>
  );
}
