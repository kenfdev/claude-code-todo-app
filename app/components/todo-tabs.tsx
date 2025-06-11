import type { FC } from 'react';

export interface TodoTabsProps {
  activeTab: 'active' | 'completed';
  activeTodosCount: number;
  completedTodosCount: number;
  onTabChange: (tab: 'active' | 'completed') => void;
}

export const TodoTabs: FC<TodoTabsProps> = ({
  activeTab,
  activeTodosCount,
  completedTodosCount,
  onTabChange,
}) => {
  return (
    <div className="border-b mb-6">
      <nav className="flex -mb-px">
        <button
          onClick={() => onTabChange('active')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'active'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          未完了 ({activeTodosCount})
        </button>
        <button
          onClick={() => onTabChange('completed')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'completed'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          完了 ({completedTodosCount})
        </button>
      </nav>
    </div>
  );
};