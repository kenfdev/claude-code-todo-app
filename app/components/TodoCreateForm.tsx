import { Form } from "react-router";
import { useState } from "react";

interface TodoCreateFormProps {
  errors?: {
    title?: string;
    notes?: string;
    general?: string;
  };
  defaultValues?: {
    title?: string;
    notes?: string;
  };
}

export function TodoCreateForm({ errors, defaultValues }: TodoCreateFormProps) {
  const [title, setTitle] = useState(defaultValues?.title || "");
  const [notes, setNotes] = useState(defaultValues?.notes || "");

  return (
    <div className="bg-white min-h-screen">
      {/* Header Navigation Bar */}
      <div className="bg-white">
        <div className="flex flex-col">
          <div className="relative">
            <div className="flex flex-row items-center justify-center overflow-hidden">
              <div className="flex flex-row gap-2.5 items-center justify-center px-24 py-3.5 w-full">
                <div className="font-bold text-black text-[17px] text-center text-nowrap w-[201px]">
                  <p className="block leading-normal">Create Task</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-2.5 w-full">
        <div className="min-h-[812px] w-full">
          <div className="flex flex-col-reverse min-h-full">
            {/* Form Fields */}
            <div className="order-2 w-full">
              <Form method="post" id="create-todo-form" className="flex flex-col w-full">
                {/* Error Display */}
                {errors?.general && (
                  <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{errors.general}</p>
                  </div>
                )}

                {/* Task Name Field */}
                <div className="bg-white w-full">
                  <div className="flex flex-col w-full">
                    {/* Subtitle */}
                    <div className="w-full">
                      <div className="flex flex-row items-center">
                        <div className="flex flex-row gap-2 items-center justify-start px-4 py-1 w-full">
                          <div className="flex-1 font-normal text-black text-[17px] text-left">
                            <p className="block leading-[1.35]">Task Name</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Text Field */}
                    <div className="bg-white w-full">
                      <div className="px-4 py-2 w-full">
                        <div className="bg-black/5 rounded-[20px] w-full">
                          <div className="flex flex-row items-center">
                            <div className="flex flex-row gap-2 items-center justify-start px-[13px] py-[13.5px] w-full">
                              <input
                                type="text"
                                name="title"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-[17px] text-black placeholder-black/50"
                                placeholder="Enter task name"
                                required
                                aria-describedby={errors?.title ? "title-error" : undefined}
                              />
                            </div>
                          </div>
                        </div>
                        {errors?.title && (
                          <p id="title-error" className="mt-1 text-sm text-red-600 px-3">
                            {errors.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Field */}
                <div className="bg-white w-full">
                  <div className="flex flex-col w-full">
                    {/* Subtitle */}
                    <div className="w-full">
                      <div className="flex flex-row items-center">
                        <div className="flex flex-row gap-2 items-center justify-start px-4 py-1 w-full">
                          <div className="flex-1 font-normal text-black text-[17px] text-left">
                            <p className="block leading-[1.35]">Notes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Text Field */}
                    <div className="bg-white w-full">
                      <div className="px-4 py-2 w-full">
                        <div className="bg-black/5 rounded-[20px] w-full">
                          <div className="flex flex-row items-center">
                            <div className="flex flex-row gap-2 items-center justify-start px-[13px] py-[13.5px] w-full">
                              <textarea
                                name="notes"
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-[17px] text-black placeholder-black/50 resize-none min-h-[1.35rem]"
                                placeholder="Add notes"
                                rows={3}
                                aria-describedby={errors?.notes ? "notes-error" : undefined}
                              />
                            </div>
                          </div>
                        </div>
                        {errors?.notes && (
                          <p id="notes-error" className="mt-1 text-sm text-red-600 px-3">
                            {errors.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Form>
            </div>

            {/* Floating Action Button */}
            <div className="bg-white order-1 w-full">
              <div className="flex flex-row items-center justify-end">
                <div className="flex flex-row gap-2 items-center justify-end p-4 w-full">
                  <button
                    type="submit"
                    form="create-todo-form"
                    className="bg-[#4e3cdb] rounded-[360px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.08)] hover:bg-[#4334b8] focus:outline-none focus:ring-2 focus:ring-[#4e3cdb] focus:ring-offset-2 transition-colors"
                  >
                    <div className="flex flex-row items-center justify-center">
                      <div className="flex flex-row gap-2 items-center justify-center p-4">
                        <div className="font-bold text-white text-[17px] text-left text-nowrap">
                          <p className="block leading-[1.35] whitespace-pre">Add</p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}