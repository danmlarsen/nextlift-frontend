import "@testing-library/jest-dom/vitest";

// `@/lib/constants` refuses to load without an API URL; tests never make
// real requests, so any value satisfies the check.
process.env.NEXT_PUBLIC_API_URL ??= "http://localhost:3000/v1";
