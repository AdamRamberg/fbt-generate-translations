const base = {
  input: 'index.js',
};

const cjs = Object.assign({}, base, {
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
});

export default [cjs];
