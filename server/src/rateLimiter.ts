import { Request, Response, NextFunction } from "express";
import { rateLimiter } from "./config/upstash";

const rateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    //its simple here but we can also use userid or user's ip address too
  try {
    const {success} = await rateLimiter.limit("my-rate-limit");

    if(!success){
        return res.status(429).send("Rate limit exceeded");
    }

    next();
  } catch (error) {
    res.status(429).send("Rate limit exceeded");
    next(error);
  }
};

export default rateLimiterMiddleware;