export function AddTaskButton() {
  return (
    <button
      type="button"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#4e3cdb] text-white shadow-lg hover:bg-[#4334b8] focus:outline-none focus:ring-2 focus:ring-[#4e3cdb] focus:ring-offset-2 transition-colors"
      aria-label="Add new task"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto"
      >
        <path
          d="M12 5V19M5 12H19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}