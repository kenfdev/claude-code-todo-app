import { useState } from "react";
import type { CreateTodoRequest, TodoPriority } from "../types/todo";

interface TodoFormProps {
  onSubmit: (todo: CreateTodoRequest) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export function TodoForm({ onSubmit, loading = false, error }: TodoFormProps) {
  const [formData, setFormData] = useState<CreateTodoRequest>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = "タイトルは必須です";
    } else if (formData.title.length > 200) {
      errors.title = "タイトルは200文字以下で入力してください";
    }
    
    if (formData.description && formData.description.length > 1000) {
      errors.description = "説明は1000文字以下で入力してください";
    }
    
    if (formData.dueDate) {
      const date = new Date(formData.dueDate);
      if (isNaN(date.getTime())) {
        errors.dueDate = "有効な日付を入力してください";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
      });
      
      // Reset form on successful submission
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
      });
      setValidationErrors({});
    } catch (err) {
      console.error("タスク作成に失敗しました:", err);
    }
  };

  const handleInputChange = (field: keyof CreateTodoRequest, value: string | TodoPriority) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">タスク作成</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タスク名
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="タスク名を入力してください"
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          {validationErrors.title && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            期限日
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          {validationErrors.dueDate && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.dueDate}</p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            優先度
          </label>
          <div className="relative">
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value as TodoPriority)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
              disabled={loading}
            >
              <option value="low">低優先度</option>
              <option value="medium">中優先度</option>
              <option value="high">高優先度</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v2m0 0v5l-3-3-3 3V4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メモ
          </label>
          <div className="relative">
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="メモを追加してください"
              rows={3}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              disabled={loading}
            />
            <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          {validationErrors.description && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
            {loading ? "作成中..." : "タスクを追加"}
          </button>
        </div>
      </form>

      {/* Navigation Icons */}
      <div className="flex justify-center space-x-8 mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          <span className="text-sm text-indigo-600 mt-1">Home</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-indigo-600 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-sm text-gray-400 mt-1">Tasks</span>
        </div>
      </div>
    </div>
  );
}