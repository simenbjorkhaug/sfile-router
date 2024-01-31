import { build, emptyDir } from 'https://deno.land/x/dnt@0.38.1/mod.ts'

await emptyDir('./npm')

await build({
  entryPoints: ['./mod.ts'],
  outDir: './npm',
  shims: {
    // see JS docs for overview and more options
    deno: true
  },
  test: false,
  typeCheck: false,
  package: {
    // package.json properties
    name: '@bjorkhaug/sfile-router',
    version: Deno.args[0],
    description: 'Small file router for using files as routes in deno.',
    license: 'MIT',
    publishConfig: {
      access: 'public',
      registry: 'https://registry.npmjs.org/',
      scope: '@bjorkhaug',
    },
    repository: {
      type: 'git',
      url: 'git+https://github.com/simenbjorkhaug/sfile-router.git',
    },
    bugs: {
      url: 'https://github.com/simenbjorkhaug/sfile-router/issues',
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync('README.md', 'npm/README.md')
  },
})
