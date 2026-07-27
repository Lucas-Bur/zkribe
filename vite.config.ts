import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  staged: { '*': 'vp check --fix' },
  fmt: {
    semi: false,
    singleQuote: true,
    trailingComma: 'all',
    sortPackageJson: true,
  },
  lint: { options: { typeAware: true, typeCheck: true } },
  plugins: [tailwindcss(), tanstackStart(), nitro(), react()],
})
