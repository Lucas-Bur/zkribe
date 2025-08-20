import { type Theme } from "@/components/ThemeProvider"
import { createServerFn } from "@tanstack/react-start"
import { getCookie, setCookie } from "@tanstack/react-start/server"
import z from "zod"

const storageKey = "ui-theme"

export const getThemeServerFn = createServerFn().handler(async () => {
  return (getCookie(storageKey) || "dark") as Theme
})

export const setThemeServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const parsedResult = z.enum(["dark", "light", "system"]).safeParse(data)
    if (!parsedResult.success) {
      throw new Error("Invalid theme provided")
    }
    return parsedResult.data
  })
  .handler(async ({ data }) => {
    await setCookie(storageKey, data)
  })
