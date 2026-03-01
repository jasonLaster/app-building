import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTodos } from '../slices/todosSlice';
import type { RootState, AppDispatch } from '../store';
import Header from '../components/Header';
import TodoList from '../components/TodoList';
import Filters from '../components/Filters';
import type { FilterType } from '../components/Filters';
import './TodoListPage.css';

export default function TodoListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: todos, loading } = useSelector((state: RootState) => state.todos);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  const filteredTodos =
    filter === 'all'
      ? todos
      : filter === 'active'
        ? todos.filter((t) => !t.completed)
        : todos.filter((t) => t.completed);

  if (loading) {
    return (
      <div className="todo-page p-6 max-sm:p-3" data-testid="todo-page">
        <div className="todo-page-container">
          <div className="todo-page-loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="todo-page p-6 max-sm:p-3" data-testid="todo-page">
      <div className="todo-page-container">
        <Header />
        <TodoList todos={filteredTodos} />
        <Filters filter={filter} onFilterChange={setFilter} todos={todos} />
      </div>
    </div>
  );
}
