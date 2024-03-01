const {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createUserFavorite,
  fetchUserFavorites,
  deleteUserFavorite,
} = require("./db");
const express = require("express");
const app = express();
app.use(express.json());

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchUserFavorites(req.params.id));
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/users/:userId/favorites/:id", async (req, res, next) => {
  try {
    await deleteUserFavorite({ user_id: req.params.userId, id: req.params.id });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res
      .status(201)
      .send(
        await createUserFavorite({
          user_id: req.params.id,
          product_id: req.body.product_id,
        })
      );
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  console.log("connecting to the database");
  await client.connect();
  console.log("connected to the database");
  await createTables();
  console.log("tables created");

  const [Shya, Luis, Torrie, Kemp, laptop, kindle, printer, airpods] =
    await Promise.all([
      createUser({ username: "Shya", password: "shya123" }),
      createUser({ username: "Luis", password: "luis123" }),
      createUser({ username: "Torrie", password: "torie123" }),
      createUser({ username: "Kemp", password: "kemp123" }),
      createProduct({ name: "laptop" }),
      createProduct({ name: "kindle" }),
      createProduct({ name: "printer" }),
      createProduct({ name: "airpods" }),
    ]);

  console.log(await fetchUsers());
  console.log(await fetchProducts());

  const userFavorites = await Promise.all([
    createUserFavorite({ user_id: Shya.id, product_id: laptop.id }),
    createUserFavorite({ user_id: Luis.id, product_id: kindle.id }),
    createUserFavorite({ user_id: Torrie.id, product_id: printer.id }),
    createUserFavorite({ user_id: Kemp.id, product_id: airpods.id }),
  ]);

  console.log(await fetchUserFavorites(Shya.id));
  await deleteUserFavorite({ user_id: Shya.id, id: userFavorites[0].id });
  console.log(await fetchUserFavorites(Shya.id));

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Listening on port ${port}`));
};

init();
