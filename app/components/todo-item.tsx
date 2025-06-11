import { useState } from "react";
import type { Todo, TodoPriority } from "../types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TodoItem({ todo, onToggleComplete, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: todo.title,
    description: todo.description || "",
    priority: todo.priority,
    dueDate: todo.dueDate || "",
  });
  const [loading, setLoading] = useState(false);

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      await onToggleComplete(todo.id, !todo.completed);
    } catch (error) {
      console.error("Failed to toggle todo completion:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority,
      dueDate: todo.dueDate || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editData.title.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onUpdate(todo.id, {
        title: editData.title.trim(),
        description: editData.description.trim() || undefined,
        priority: editData.priority,
        dueDate: editData.dueDate || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update todo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority,
      dueDate: todo.dueDate || "",
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("このTodoを削除しますか？")) {
      return;
    }

    setLoading(true);
    try {
      await onDelete(todo.id);
    } catch (error) {
      console.error("Failed to delete todo:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: TodoPriority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityLabel = (priority: TodoPriority) => {
    switch (priority) {
      case "high":
        return "高";
      case "medium":
        return "中";
      case "low":
        return "低";
      default:
        return "中";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="space-y-3">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="タイトル"
            disabled={loading}
          />
          
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="説明"
            rows={2}
            disabled={loading}
          />
          
          <div className="flex space-x-3">
            <select
              value={editData.priority}
              onChange={(e) => setEditData({ ...editData, priority: e.target.value as TodoPriority })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            >
              <option value="low">低優先度</option>
              <option value="medium">中優先度</option>
              <option value="high">高優先度</option>
            </select>
            
            <input
              type="date"
              value={editData.dueDate}
              onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleSaveEdit}
              disabled={loading || !editData.title.trim()}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${todo.completed ? 'opacity-75' : ''}`}>
      <div className="flex items-start space-x-3">
        <button
          onClick={handleToggleComplete}
          disabled={loading}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            todo.completed
              ? "bg-indigo-600 border-indigo-600"
              : "border-gray-300 hover:border-indigo-600"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {todo.completed && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-sm font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {todo.title}
              </h3>
              {todo.description && (
                <p className={`mt-1 text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                  {todo.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                {getPriorityLabel(todo.priority)}
              </span>
              
              {!todo.completed && (
                <>
                  <button
                    onClick={handleEdit}
                    disabled={loading}
                    className="text-gray-400 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            {todo.dueDate && (
              <span className="text-xs text-gray-500">
                期限: {formatDate(todo.dueDate)}
              </span>
            )}
            <span className="text-xs text-gray-400">
              作成: {formatDate(todo.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}