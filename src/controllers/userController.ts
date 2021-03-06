import Controller from "../interfaces/controllerInterface";
import { Router, NextFunction, Response, Request } from "express";
import RequestWithUser from "../interfaces/requestWithUserInterface";
import NotAuthorizedException from "../exceptions/NotAuthorizedException";
import authMiddleware from "../middleware/authMiddleware";
import { V2_BASE_URL } from "../Utils/constants";
import User from "../entity/user";
import { getRepository } from "typeorm";
import Post from "../entity/posts";

class UserController implements Controller {
  public path = `${V2_BASE_URL}/users`;
  public router = Router();
  private userRepository = getRepository(User);
  private postRepository = getRepository(Post);
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(
      `${this.path}/:id/posts`,
      authMiddleware,
      this.getUserPosts
    );
    this.router.get(
      `${this.path}/:id/posts/:postId`,
      authMiddleware,
      this.getUserPost
    );
    this.router.get(this.path, authMiddleware, this.getUsers);
    this.router.get(`${this.path}/:id`, authMiddleware, this.getUser);
  }

  getUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const feedback = await this.userRepository.find();
      res.status(200).send({ users: feedback });
    } catch (error) {
      next(new NotAuthorizedException());
    }
  };

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const feedback = await this.userRepository.findOne(id);
      res.status(200).send({ user: feedback });
    } catch (error) {
      next(new NotAuthorizedException());
    }
  };

  getUserPosts = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.params.id;
    if (userId === req.user.id.toString()) {
      const feedback = await this.postRepository.find({
        where: { author: userId },
        relations: ["categories"]
      });
      res.status(200).send({ posts: feedback });
    } else {
      next(new NotAuthorizedException());
    }
  };

  getUserPost = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.params.id;
    const postId = req.params.postId;
    if (userId === req.user.id.toString()) {
      const feedback = await this.postRepository.findOne(postId, {
        where: { author: userId },
        relations: ["categories"]
      });
      res.status(200).send({ posts: feedback });
    } else {
      next(new NotAuthorizedException());
    }
  };
}

export default UserController;
