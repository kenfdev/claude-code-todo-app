export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const createTodoValidation = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 200,
  },
  description: {
    maxLength: 1000,
  },
  priority: {
    enum: ["low", "medium", "high"] as const,
  },
  dueDate: {
    format: "date",
  },
};

export function validateCreateTodo(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Title validation
  if (!data.title || typeof data.title !== "string") {
    errors.push({ field: "title", message: "タイトルは必須です" });
  } else {
    const title = data.title.trim();
    if (title.length === 0) {
      errors.push({ field: "title", message: "タイトルは必須です" });
    } else if (title.length > 200) {
      errors.push({ field: "title", message: "タイトルは200文字以下で入力してください" });
    }
  }

  // Description validation
  if (data.description && typeof data.description === "string") {
    if (data.description.length > 1000) {
      errors.push({ field: "description", message: "説明は1000文字以下で入力してください" });
    }
  }

  // Priority validation
  if (data.priority && !["low", "medium", "high"].includes(data.priority)) {
    errors.push({ field: "priority", message: "優先度は low, medium, high のいずれかを指定してください" });
  }

  // Due date validation
  if (data.dueDate && typeof data.dueDate === "string") {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.dueDate)) {
      errors.push({ field: "dueDate", message: "日付はYYYY-MM-DD形式で入力してください" });
    } else {
      const date = new Date(data.dueDate);
      if (isNaN(date.getTime())) {
        errors.push({ field: "dueDate", message: "有効な日付を入力してください" });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateUpdateTodo(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Title validation (optional for update)
  if (data.title !== undefined) {
    if (typeof data.title !== "string") {
      errors.push({ field: "title", message: "タイトルは文字列で入力してください" });
    } else {
      const title = data.title.trim();
      if (title.length === 0) {
        errors.push({ field: "title", message: "タイトルは必須です" });
      } else if (title.length > 200) {
        errors.push({ field: "title", message: "タイトルは200文字以下で入力してください" });
      }
    }
  }

  // Description validation
  if (data.description !== undefined && typeof data.description === "string") {
    if (data.description.length > 1000) {
      errors.push({ field: "description", message: "説明は1000文字以下で入力してください" });
    }
  }

  // Completed validation
  if (data.completed !== undefined && typeof data.completed !== "boolean") {
    errors.push({ field: "completed", message: "完了状態はboolean値で指定してください" });
  }

  // Priority validation
  if (data.priority !== undefined && !["low", "medium", "high"].includes(data.priority)) {
    errors.push({ field: "priority", message: "優先度は low, medium, high のいずれかを指定してください" });
  }

  // Due date validation
  if (data.dueDate !== undefined && typeof data.dueDate === "string") {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.dueDate)) {
      errors.push({ field: "dueDate", message: "日付はYYYY-MM-DD形式で入力してください" });
    } else {
      const date = new Date(data.dueDate);
      if (isNaN(date.getTime())) {
        errors.push({ field: "dueDate", message: "有効な日付を入力してください" });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}