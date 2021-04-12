import { APP_BASE_HREF } from '@angular/common';
import { NgSetupOptions, ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';

export interface ServerAPIOptions {
  distPath: string;
  ngSetup: NgSetupOptions;
  hideSourceMap: boolean;
}

export function createApi(options: ServerAPIOptions): express.Express {
  const router = express();

  // Ensures source maps aren't readable on production
  if (options.hideSourceMap) {
    router.get('*.(cs|j)s.map', (req, res) => res.sendStatus(404));
  }

  router.use(createNgRenderMiddleware(options.distPath, options.ngSetup));

  return router;
}

export function createNgRenderMiddleware(
  distPath: string,
  ngSetup: NgSetupOptions
): express.Express {
  const router = express();

  router.set('view engine', 'html');
  router.set('views', distPath);

  // Server static files from distPath
  router.get('*.*', express.static(distPath, { maxAge: '1y' }), (req, res, next) => {
    if (/\.\w+$/.test(req.path)) {
      res.sendStatus(404);
    } else {
      next();
    }
  });

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  router.engine('html', ngExpressEngine(ngSetup) as any);

  // All regular routes use the Universal engine
  router.get('*', (req, res) =>
    res.render('index', {
      req,
      res,
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: req.baseUrl,
        },
      ],
    })
  );

  return router;
}
