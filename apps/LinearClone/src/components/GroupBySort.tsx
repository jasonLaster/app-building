import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { setGroupBy, setSortBy } from '../slices/teamIssuesSlice';
import './GroupBySort.css';

const GROUP_OPTIONS: Array<{ value: 'status' | 'priority' | 'assignee' | 'project' | 'label' | 'none'; label: string }> = [
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'assignee', label: 'Assignee' },
  { value: 'project', label: 'Project' },
  { value: 'label', label: 'Label' },
  { value: 'none', label: 'None' },
];

const SORT_OPTIONS: Array<{ value: 'priority' | 'created' | 'updated' | 'status'; label: string }> = [
  { value: 'priority', label: 'Priority' },
  { value: 'created', label: 'Created date' },
  { value: 'updated', label: 'Updated date' },
  { value: 'status', label: 'Status' },
];

type DropdownType = 'group' | 'sort' | null;

export default function GroupBySort() {
  const dispatch = useDispatch<AppDispatch>();
  const { groupBy, sortBy } = useSelector((state: RootState) => state.teamIssues);
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);

  function toggleDropdown(type: DropdownType) {
    setOpenDropdown(openDropdown === type ? null : type);
  }

  const currentGroupLabel = GROUP_OPTIONS.find((o) => o.value === groupBy)?.label || 'Status';
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Priority';

  return (
    <div className="group-by-sort" data-testid="group-by-sort">
      {openDropdown && <div className="dropdown-mask" onClick={() => setOpenDropdown(null)} />}
      <div className="group-by-sort-control">
        <button
          className="group-by-sort-btn"
          onClick={() => toggleDropdown('group')}
          data-testid="group-by-btn"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="15" y2="12" />
            <line x1="3" y1="18" x2="9" y2="18" />
          </svg>
          Group: {currentGroupLabel}
        </button>
        {openDropdown === 'group' && (
          <div className="group-by-sort-dropdown" data-testid="group-by-dropdown">
            {GROUP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`group-by-sort-option ${groupBy === opt.value ? 'group-by-sort-option-active' : ''}`}
                onClick={() => {
                  dispatch(setGroupBy(opt.value));
                  setOpenDropdown(null);
                }}
                data-testid={`group-by-option-${opt.value}`}
              >
                {opt.label}
                {groupBy === opt.value && (
                  <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="group-by-sort-control">
        <button
          className="group-by-sort-btn"
          onClick={() => toggleDropdown('sort')}
          data-testid="sort-by-btn"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 9 6" />
            <polyline points="3 12 15 12" />
            <polyline points="3 18 21 18" />
          </svg>
          Sort: {currentSortLabel}
        </button>
        {openDropdown === 'sort' && (
          <div className="group-by-sort-dropdown" data-testid="sort-by-dropdown">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`group-by-sort-option ${sortBy === opt.value ? 'group-by-sort-option-active' : ''}`}
                onClick={() => {
                  dispatch(setSortBy(opt.value));
                  setOpenDropdown(null);
                }}
                data-testid={`sort-by-option-${opt.value}`}
              >
                {opt.label}
                {sortBy === opt.value && (
                  <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
