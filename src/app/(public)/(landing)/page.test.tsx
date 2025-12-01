import { render, screen } from "@testing-library/react";
import LandingPage from "./page";

vi.mock("@/api/auth/auth-guard", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("Landing page", () => {
  it("renders a heading", () => {
    render(<LandingPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
