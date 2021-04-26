var path = require('path');

module.exports = {
  entry: './src/main.js',
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
  
};
