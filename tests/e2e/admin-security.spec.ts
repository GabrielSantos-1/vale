import { expect, test } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

test.describe("admin csrf protection", () => {
  test.skip(
    !adminEmail || !adminPassword,
    "E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD não configurados"
  );

  test("blocks mutation without csrf header and allows with token", async ({
    page,
  }) => {
    await page.goto("/admin/login");

    await page.getByLabel("E-mail").fill(adminEmail!);
    await page.getByLabel("Senha").fill(adminPassword!);
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.waitForURL("**/admin/**");
    await page.goto("/admin/faq");

    const noCsrfStatus = await page.evaluate(async () => {
      const res = await fetch("/api/admin/faq", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: "E2E sem csrf",
          answer: "deve falhar",
        }),
      });

      return res.status;
    });

    expect(noCsrfStatus).toBe(403);

    const withCsrfStatus = await page.evaluate(async () => {
      const tokenCookie = document.cookie
        .split(";")
        .map((value) => value.trim())
        .find((entry) => entry.startsWith("vv_csrf_token="));

      const token = tokenCookie
        ? decodeURIComponent(tokenCookie.split("=")[1] ?? "")
        : "";

      const res = await fetch("/api/admin/faq", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": token,
        },
        body: JSON.stringify({
          question: "E2E com csrf",
          answer: "deve passar",
          category: "teste-e2e",
          isPublished: false,
        }),
      });

      return res.status;
    });

    expect(withCsrfStatus).toBe(201);
  });
});
