import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { insertDatabase, insertUser } from "../test_helper.factories.js";
import application from "../application.js";

describe("GET /databases", () => {
  it("responds with success and returns databases", async () => {
    const { databases, users } = await database.transaction().execute(async (transaction) => {
      const databases: { id: string; created_at: Date; updated_at: Date }[] = [];
      const users: { id: string; created_at: Date; updated_at: Date }[] = [];

      for (let index = 1; index <= 11; index++) {
        const user = await insertUser(transaction, {
          display_name: `User ${index}`,
          username: `user_${index}`,
        });
        users.push(user);
        const database = await insertDatabase(transaction, {
          user_id: user.id,
        });
        databases.push(database);
      }

      return { databases, users };
    });

    const firstPage = {
      page: [
        {
          id: databases[0].id,
          created_at: databases[0].created_at,
          kind: "earbuds",
          path: "/",
          updated_at: databases[0].updated_at,
          user_id: users[0].id,
        },
        {
          id: databases[1].id,
          created_at: databases[1].created_at,
          kind: "earbuds",
          path: "/",
          updated_at: databases[1].updated_at,
          user_id: users[1].id,
        },
        {
          id: databases[2].id,
          created_at: databases[2].created_at,
          kind: "earbuds",
          path: "/",
          updated_at: databases[2].updated_at,
          user_id: users[2].id,
        },
        {
          id: databases[3].id,
          created_at: databases[3].created_at,
          kind: "earbuds",
          path: "/",
          updated_at: databases[3].updated_at,
          user_id: users[3].id,
        },
        {
          id: databases[4].id,
          created_at: databases[4].created_at,
          kind: "earbuds",
          path: "/",
          updated_at: databases[4].updated_at,
          user_id: users[4].id,
        },
        {
          id: databases[5].id,
          created_at: databases[5].created_at,
          kind: "earbuds",
          path: "/",
          updated_at: databases[5].updated_at,
          user_id: users[5].id,
        },
        {
          id: databases[6].id,
          created_at: databases[6].created_at,
          kind: "earbuds",
          path: "/",
          updated_at: databases[6].updated_at,
          user_id: users[6].id,
        },
        {
          id: databases[7].id,
          created_at: databases[7].created_at,
          kind: "earbuds",
          path: "/",
          updated_at: databases[7].updated_at,
          user_id: users[7].id,
        },
        {
          id: databases[8].id,
          created_at: databases[8].created_at,
          kind: "earbuds",
          path: "/",
          updated_at: databases[8].updated_at,
          user_id: users[8].id,
        },
        {
          id: databases[9].id,
          created_at: databases[9].created_at,
          kind: "earbuds",
          path: "/",
          updated_at: databases[9].updated_at,
          user_id: users[9].id,
        },
      ],
      page_count: 2,
    };
    const secondPage = {
      page: [
        {
          id: databases[10].id,
          created_at: databases[10].created_at,
          kind: "earbuds",
          path: "/",
          updated_at: databases[10].updated_at,
          user_id: users[10].id,
        },
      ],
      page_count: 2,
    };

    const pagelessResponse = await application.request("/databases");
    expect(await pagelessResponse.json()).toEqual(firstPage);
    expect(pagelessResponse.ok).toBe(true);

    const firstPageResponse = await application.request("/databases?page=1");
    expect(await firstPageResponse.json()).toEqual(firstPage);
    expect(firstPageResponse.ok).toBe(true);

    const secondPageResponse = await application.request("/databases?page=2");
    expect(await secondPageResponse.json()).toEqual(secondPage);
    expect(secondPageResponse.ok).toBe(true);
  });

  it("responds with success and queries the kind", async () => {
    const { databases, users } = await database.transaction().execute(async (transaction) => {
      const databases: { id: string; created_at: Date; updated_at: Date }[] = [];
      const users: { id: string; created_at: Date; updated_at: Date }[] = [];

      for (let index = 1; index <= 11; index++) {
        const user = await insertUser(transaction, {
          display_name: `User ${index}`,
          username: `user_${index}`,
        });
        users.push(user);
        const database = await insertDatabase(transaction, {
          kind: index > 8 ? "earbuds" : "headphones",
          path: "/",
          user_id: user.id,
        });
        databases.push(database);
      }

      return { databases, users };
    });

    const firstPage = {
      page: [
        {
          id: databases[8].id,
          created_at: databases[8].created_at,
          kind: "earbuds",
          path: "/",
          updated_at: databases[8].updated_at,
          user_id: users[8].id,
        },
        {
          id: databases[9].id,
          created_at: databases[9].created_at,
          kind: "earbuds",
          path: "/",
          updated_at: databases[9].updated_at,
          user_id: users[9].id,
        },
        {
          id: databases[10].id,
          created_at: databases[10].created_at,
          kind: "earbuds",
          path: "/",
          updated_at: databases[10].updated_at,
          user_id: users[10].id,
        },
        {
          id: databases[0].id,
          created_at: databases[0].created_at,
          kind: "headphones",
          path: "/",
          updated_at: databases[0].updated_at,
          user_id: users[0].id,
        },
        {
          id: databases[1].id,
          created_at: databases[1].created_at,
          kind: "headphones",
          path: "/",
          updated_at: databases[1].updated_at,
          user_id: users[1].id,
        },
        {
          id: databases[2].id,
          created_at: databases[2].created_at,
          kind: "headphones",
          path: "/",
          updated_at: databases[2].updated_at,
          user_id: users[2].id,
        },
        {
          id: databases[3].id,
          created_at: databases[3].created_at,
          kind: "headphones",
          path: "/",
          updated_at: databases[3].updated_at,
          user_id: users[3].id,
        },
        {
          id: databases[4].id,
          created_at: databases[4].created_at,
          kind: "headphones",
          path: "/",
          updated_at: databases[4].updated_at,
          user_id: users[4].id,
        },
        {
          id: databases[5].id,
          created_at: databases[5].created_at,
          kind: "headphones",
          path: "/",
          updated_at: databases[5].updated_at,
          user_id: users[5].id,
        },
        {
          id: databases[6].id,
          created_at: databases[6].created_at,
          kind: "headphones",
          path: "/",
          updated_at: databases[6].updated_at,
          user_id: users[6].id,
        },
      ],
      page_count: 2,
    };
    const secondPage = {
      page: [
        {
          id: databases[7].id,
          created_at: databases[7].created_at,
          kind: "headphones",
          path: "/",
          updated_at: databases[7].updated_at,
          user_id: users[7].id,
        },
      ],
      page_count: 2,
    };

    const pagelessResponse = await application.request("/databases?query=earbuds");
    expect(await pagelessResponse.json()).toEqual(firstPage);
    expect(pagelessResponse.ok).toBe(true);

    const firstPageResponse = await application.request("/databases?query=earbuds?page=1");
    expect(await firstPageResponse.json()).toEqual(firstPage);
    expect(firstPageResponse.ok).toBe(true);

    const secondPageResponse = await application.request("/databases?query=earbuds?page=2");
    expect(await secondPageResponse.json()).toEqual(secondPage);
    expect(secondPageResponse.ok).toBe(true);
  });

  it("responds with success and queries the path", async () => {
    const { databases, users } = await database.transaction().execute(async (transaction) => {
      const databases: { id: string; created_at: Date; updated_at: Date }[] = [];
      const users: { id: string; created_at: Date; updated_at: Date }[] = [];

      for (let index = 1; index <= 11; index++) {
        const user = await insertUser(transaction, {
          display_name: `User ${index}`,
          username: `user_${index}`,
        });
        users.push(user);
        const database = await insertDatabase(transaction, {
          path: index > 8 ? "/foo" : "/bar",
          user_id: user.id,
        });
        databases.push(database);
      }

      return { databases, users };
    });

    const firstPage = {
      page: [
        {
          id: databases[8].id,
          created_at: databases[8].created_at,
          kind: "earbuds",
          path: "/foo",
          updated_at: databases[8].updated_at,
          user_id: users[8].id,
        },
        {
          id: databases[9].id,
          created_at: databases[9].created_at,
          kind: "earbuds",
          path: "/foo",
          updated_at: databases[9].updated_at,
          user_id: users[9].id,
        },
        {
          id: databases[10].id,
          created_at: databases[10].created_at,
          kind: "earbuds",
          path: "/foo",
          updated_at: databases[10].updated_at,
          user_id: users[10].id,
        },
        {
          id: databases[0].id,
          created_at: databases[0].created_at,
          kind: "earbuds",
          path: "/bar",
          updated_at: databases[0].updated_at,
          user_id: users[0].id,
        },
        {
          id: databases[1].id,
          created_at: databases[1].created_at,
          kind: "earbuds",
          path: "/bar",
          updated_at: databases[1].updated_at,
          user_id: users[1].id,
        },
        {
          id: databases[2].id,
          created_at: databases[2].created_at,
          kind: "earbuds",
          path: "/bar",
          updated_at: databases[2].updated_at,
          user_id: users[2].id,
        },
        {
          id: databases[3].id,
          created_at: databases[3].created_at,
          kind: "earbuds",
          path: "/bar",
          updated_at: databases[3].updated_at,
          user_id: users[3].id,
        },
        {
          id: databases[4].id,
          created_at: databases[4].created_at,
          kind: "earbuds",
          path: "/bar",
          updated_at: databases[4].updated_at,
          user_id: users[4].id,
        },
        {
          id: databases[5].id,
          created_at: databases[5].created_at,
          kind: "earbuds",
          path: "/bar",
          updated_at: databases[5].updated_at,
          user_id: users[5].id,
        },
        {
          id: databases[6].id,
          created_at: databases[6].created_at,
          kind: "earbuds",
          path: "/bar",
          updated_at: databases[6].updated_at,
          user_id: users[6].id,
        },
      ],
      page_count: 2,
    };
    const secondPage = {
      page: [
        {
          id: databases[7].id,
          created_at: databases[7].created_at,
          kind: "earbuds",
          path: "/bar",
          updated_at: databases[7].updated_at,
          user_id: users[7].id,
        },
      ],
      page_count: 2,
    };

    const pagelessResponse = await application.request("/databases?query=foo");
    expect(await pagelessResponse.json()).toEqual(firstPage);
    expect(pagelessResponse.ok).toBe(true);

    const firstPageResponse = await application.request("/databases?query=foo&page=1");
    expect(await firstPageResponse.json()).toEqual(firstPage);
    expect(firstPageResponse.ok).toBe(true);

    const secondPageResponse = await application.request("/databases?query=foo&page=2");
    expect(await secondPageResponse.json()).toEqual(secondPage);
    expect(secondPageResponse.ok).toBe(true);
  });
});
