// contents of webpack.config.js
const path = require('path');
const pkg = require('./package.json');

module.exports = {
	entry: `./src/${pkg.entry}.jsx`,
	output: {
		filename: pkg.output,
		path: path.resolve(__dirname, 'dist'),
		libraryTarget: 'system',
	},
	externals: {
		'@builder.io/react': '@builder.io/react',
		'@builder.io/app-context': '@builder.io/app-context',
		"react": "react",
		"react-dom": "react-dom",
	},
	resolve: {
		extensions: ['.js', '.jsx'],
	},
	module: {
		rules: [
			{
				test: /\.(jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader'],
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	devServer: {
		port: 1268,
		static: {
			directory: path.join(__dirname, './dist'),
		},
		headers: {
			'Access-Control-Allow-Private-Network': 'true',
			'Access-Control-Allow-Origin': '*',
		},
	},
};
