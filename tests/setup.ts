import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useFetcher: () => ({
      submit: vi.fn(),
    }),
    useSearchParams: () => {
      const params = new URLSearchParams();
      const setSearchParams = vi.fn();
      return [params, setSearchParams];
    },
  };
});