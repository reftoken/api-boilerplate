/**
 * Creates a User entry in the Database
 * User must be attached to context first
 *
 * @param {*} ctx
 */
const create = async ctx => {
  const { User, ContextUser } = ctx.models;
  const user = ctx.user.getForDB();
  const userModel = await new User(user);
  await userModel.save(err => {
    if (err) {
      // TODO: Error logging
      console.log(err);
      const { InternalServerError } = ctx.errors.ServerErrors;
      ctx.throw(new InternalServerError());
    }
  });
  ctx.user = new ContextUser(userModel);
};

/**
 * Matches the current user in the context against the database.
 * If not entry exists in the database, a new User entry is created in the database.
 *
 * @param {*} ctx
 * @param {*} next
 */
const match = async (ctx, next) => {
  const { User, ContextUser } = ctx.models;
  await User.findOne(
    { email: ctx.user.email },
    'firstName lastName email _id picture provider',
    async (err, user) => {
      if (err) {
        // TODO: Error logging
        console.log(err);
        const { InternalServerError } = ctx.errors.ServerErrors;
        ctx.throw(new InternalServerError());
      } else if (!user) {
        try {
          await create(ctx);
          await next();
        } catch (error) {
          // TODO: Error logging
          console.log(error);
          const { InternalServerError } = ctx.errors.ServerErrors;
          ctx.throw(new InternalServerError());
        }
      } else if (user) {
        ctx.user = new ContextUser(user);
        await next();
      }
    },
  );
};

/**
 * Lists all Users
 * Might not work... hehe >:D
 *
 * @param {*} ctx
 */
const list = async ctx => {
  const { User } = ctx.models;
  ctx
    .validateQuery('page')
    .defaultTo(1)
    .toInt()
    .gte(1);
  // ctx
  //   .validateQuery('limit')
  //   .defaultTo(10)
  //   .toInt()
  //   .gte(1);
  const { page, limit } = ctx.vals;
  const count = await ctx.services.user.count(ctx);
  const users = await User.find()
    .skip((page - 1) * limit)
    .limit(limit);
  ctx.body = {
    count,
    page,
    limit,
    users,
  };
};

/**
 * Saves the email token to the User in the database
 * If no matching user is found, a new User entry is created in the database
 *
 * @param {*} ctx
 * @param {*} next
 */
const saveEmailToken = async (ctx, next) => {
  const { email } = ctx.request.body;
  const { User, ContextUser } = ctx.models;
  const { encrypted } = ctx;
  await User.updateOne({ email }, { token: encrypted }, async (err, res) => {
    if (err) {
      // TODO: Error logging
      console.log(err);
      const { InternalServerError } = ctx.errors.ServerErrors;
      ctx.throw(new InternalServerError());
    }
    if (res.nModified === 0) {
      ctx.user = new ContextUser({
        email,
        provider: 'email',
        token: encrypted,
      });
      await create(ctx);
    }
  });
  await next();
};

module.exports = {
  create,
  match,
  list,
  saveEmailToken,
};
