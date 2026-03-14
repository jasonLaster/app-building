import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { openCreateIssueModal } from '../slices/uiSlice';

const CHORD_TIMEOUT_MS = 1000;

export default function KeyboardShortcuts() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { createIssueModalOpen } = useSelector((state: RootState) => state.ui);

  const gPressedRef = useRef(false);
  const chordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearChord = useCallback(() => {
    gPressedRef.current = false;
    if (chordTimeoutRef.current) {
      clearTimeout(chordTimeoutRef.current);
      chordTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const tagName = target.tagName;
      if (
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      if (createIssueModalOpen) {
        return;
      }

      const key = e.key.toLowerCase();

      if (gPressedRef.current) {
        clearChord();
        if (key === 'i') {
          e.preventDefault();
          navigate('/my-issues');
        } else if (key === 'n') {
          e.preventDefault();
          navigate('/inbox');
        }
        return;
      }

      if (key === 'c') {
        e.preventDefault();
        dispatch(openCreateIssueModal());
      } else if (key === 'g') {
        e.preventDefault();
        gPressedRef.current = true;
        chordTimeoutRef.current = setTimeout(() => {
          gPressedRef.current = false;
          chordTimeoutRef.current = null;
        }, CHORD_TIMEOUT_MS);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearChord();
    };
  }, [navigate, dispatch, createIssueModalOpen, clearChord]);

  return null;
}
