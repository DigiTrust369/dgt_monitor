const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const fileUpload = require('express-fileupload');
const routes = require('@routes');
const apiRoutes = require('@routes/v1');
const { logs } = require('@config/vars');
const { sentry } = require('@config/logger');
const error = require('@middlewares/error');

/**
* Express instance
* @public
*/
const app = express();

// The request handler must be the first middleware on the app
app.use(sentry.Handlers.requestHandler());

// enable files upload
app.use(fileUpload());

// request logging. dev: console | production: file
app.use(morgan(logs, {
  skip: function (req, res) {
    return req.url.indexOf('/status') === 0 || req.url.indexOf('/assets') === 0 || req.url.indexOf('/reports') === 0;
  }
}));

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// gzip compression
app.use(compress());

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// dashboard ui
app.use(express.static('public'));

app.use('/assets', express.static('public/assets'));

// mount base routers
app.use('/', routes);

// mount api v1 routes
app.use('/v1', apiRoutes);

// The error handler must be before any other error middleware and after all controllers
app.use(sentry.Handlers.errorHandler());

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

module.exports = app;
