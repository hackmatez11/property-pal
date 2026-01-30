import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { connectRedis } from './config/redis';
import logger from './utils/logger';
import errorHandler from './middlewares/errorHandler';
import { generalLimiter } from './middlewares/rateLimiter';

// Routes
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import subscriptionRoutes from './routes/subscription.routes';
import leadRoutes from './routes/lead.routes';
import aiRoutes from './routes/ai.routes';
import mediaRoutes from './routes/media.routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS
    this.app.use(
      cors({
        origin: config.cors.origin,
        credentials: true,
      })
    );

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (config.env === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(
        morgan('combined', {
          stream: {
            write: (message: string) => {
              logger.info(message.trim());
            },
          },
        })
      );
    }

    // Rate limiting
    this.app.use('/api/', generalLimiter);
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.env,
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/properties', propertyRoutes);
    this.app.use('/api/subscriptions', subscriptionRoutes);
    this.app.use('/api/leads', leadRoutes);
    this.app.use('/api/ai', aiRoutes);
    this.app.use('/api/media', mediaRoutes);

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'The requested resource was not found',
        },
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async listen(): Promise<void> {
    try {
      // Connect to Redis
      await connectRedis();
      logger.info('Redis connected successfully');

      // Start server
      this.app.listen(config.port, () => {
        logger.info(`Server running on port ${config.port} in ${config.env} mode`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

export default App;
