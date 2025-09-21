import application from "../application.js";
import { database } from "../database.js";
import { describe, expect, it } from "vitest";
import { insertDatabase, insertUser } from "../test_helper.factories.js";

describe("GET /databases", () => {
  it("responds with success and returns databases", async () => {
    const { databases, users } = await database.transaction().execute(async (transaction) => {
      const databases: {
        created_at: Date;
        id: string;
        kind: string;
        path: string;
        updated_at: Date;
      }[] = [];
      const users: { created_at: Date; id: string; updated_at: Date }[] = [];

      for (let index = 1; index <= 11; index++) {
        const user = await insertUser(transaction);
        users.push(user);
        const database = await insertDatabase(transaction, { user_id: user.id });
        databases.push(database);
      }

      return { databases, users };
    });

    const firstPage = {
      page_count: 2,
      page: [
        {
          created_at: databases[0].created_at,
          id: databases[0].id,
          kind: databases[0].kind,
          path: databases[0].path,
          updated_at: databases[0].updated_at,
          user_id: users[0].id,
        },
        {
          created_at: databases[1].created_at,
          id: databases[1].id,
          kind: databases[1].kind,
          path: databases[1].path,
          updated_at: databases[1].updated_at,
          user_id: users[1].id,
        },
        {
          created_at: databases[2].created_at,
          id: databases[2].id,
          kind: databases[2].kind,
          path: databases[2].path,
          updated_at: databases[2].updated_at,
          user_id: users[2].id,
        },
        {
          created_at: databases[3].created_at,
          id: databases[3].id,
          kind: databases[3].kind,
          path: databases[3].path,
          updated_at: databases[3].updated_at,
          user_id: users[3].id,
        },
        {
          created_at: databases[4].created_at,
          id: databases[4].id,
          kind: databases[4].kind,
          path: databases[4].path,
          updated_at: databases[4].updated_at,
          user_id: users[4].id,
        },
        {
          created_at: databases[5].created_at,
          id: databases[5].id,
          kind: databases[5].kind,
          path: databases[5].path,
          updated_at: databases[5].updated_at,
          user_id: users[5].id,
        },
        {
          created_at: databases[6].created_at,
          id: databases[6].id,
          kind: databases[6].kind,
          path: databases[6].path,
          updated_at: databases[6].updated_at,
          user_id: users[6].id,
        },
        {
          created_at: databases[7].created_at,
          id: databases[7].id,
          kind: databases[7].kind,
          path: databases[7].path,
          updated_at: databases[7].updated_at,
          user_id: users[7].id,
        },
        {
          created_at: databases[8].created_at,
          id: databases[8].id,
          kind: databases[8].kind,
          path: databases[8].path,
          updated_at: databases[8].updated_at,
          user_id: users[8].id,
        },
        {
          created_at: databases[9].created_at,
          id: databases[9].id,
          kind: databases[9].kind,
          path: databases[9].path,
          updated_at: databases[9].updated_at,
          user_id: users[9].id,
        },
      ],
    };
    const secondPage = {
      page_count: 2,
      page: [
        {
          created_at: databases[10].created_at,
          id: databases[10].id,
          kind: databases[10].kind,
          path: databases[10].path,
          updated_at: databases[10].updated_at,
          user_id: users[10].id,
        },
      ],
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
      const databases: {
        created_at: Date;
        id: string;
        kind: string;
        path: string;
        updated_at: Date;
      }[] = [];
      const users: { created_at: Date; id: string; updated_at: Date }[] = [];

      for (let index = 1; index <= 11; index++) {
        const user = await insertUser(transaction);
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
      page_count: 2,
      page: [
        {
          created_at: databases[8].created_at,
          id: databases[8].id,
          kind: databases[8].kind,
          path: databases[8].path,
          updated_at: databases[8].updated_at,
          user_id: users[8].id,
        },
        {
          created_at: databases[9].created_at,
          id: databases[9].id,
          kind: databases[9].kind,
          path: databases[9].path,
          updated_at: databases[9].updated_at,
          user_id: users[9].id,
        },
        {
          created_at: databases[10].created_at,
          id: databases[10].id,
          kind: databases[10].kind,
          path: databases[10].path,
          updated_at: databases[10].updated_at,
          user_id: users[10].id,
        },
        {
          created_at: databases[0].created_at,
          id: databases[0].id,
          kind: databases[0].kind,
          path: databases[0].path,
          updated_at: databases[0].updated_at,
          user_id: users[0].id,
        },
        {
          created_at: databases[1].created_at,
          id: databases[1].id,
          kind: databases[1].kind,
          path: databases[1].path,
          updated_at: databases[1].updated_at,
          user_id: users[1].id,
        },
        {
          created_at: databases[2].created_at,
          id: databases[2].id,
          kind: databases[2].kind,
          path: databases[2].path,
          updated_at: databases[2].updated_at,
          user_id: users[2].id,
        },
        {
          created_at: databases[3].created_at,
          id: databases[3].id,
          kind: databases[3].kind,
          path: databases[3].path,
          updated_at: databases[3].updated_at,
          user_id: users[3].id,
        },
        {
          created_at: databases[4].created_at,
          id: databases[4].id,
          kind: databases[4].kind,
          path: databases[4].path,
          updated_at: databases[4].updated_at,
          user_id: users[4].id,
        },
        {
          created_at: databases[5].created_at,
          id: databases[5].id,
          kind: databases[5].kind,
          path: databases[5].path,
          updated_at: databases[5].updated_at,
          user_id: users[5].id,
        },
        {
          created_at: databases[6].created_at,
          id: databases[6].id,
          kind: databases[6].kind,
          path: databases[6].path,
          updated_at: databases[6].updated_at,
          user_id: users[6].id,
        },
      ],
    };
    const secondPage = {
      page_count: 2,
      page: [
        {
          created_at: databases[7].created_at,
          id: databases[7].id,
          kind: databases[7].kind,
          path: databases[7].path,
          updated_at: databases[7].updated_at,
          user_id: users[7].id,
        },
      ],
    };

    const pagelessResponse = await application.request("/databases?query=earbuds");
    expect(await pagelessResponse.json()).toEqual(firstPage);
    expect(pagelessResponse.ok).toBe(true);

    const firstPageResponse = await application.request("/databases?query=earbuds&page=1");
    expect(await firstPageResponse.json()).toEqual(firstPage);
    expect(firstPageResponse.ok).toBe(true);

    const secondPageResponse = await application.request("/databases?query=earbuds&page=2");
    expect(await secondPageResponse.json()).toEqual(secondPage);
    expect(secondPageResponse.ok).toBe(true);
  });

  it("responds with success and queries the path", async () => {
    const { databases, users } = await database.transaction().execute(async (transaction) => {
      const databases: {
        created_at: Date;
        id: string;
        kind: string;
        path: string;
        updated_at: Date;
      }[] = [];
      const users: { created_at: Date; id: string; updated_at: Date }[] = [];

      for (let index = 1; index <= 11; index++) {
        const user = await insertUser(transaction);
        users.push(user);
        const database = await insertDatabase(transaction, {
          kind: "earbuds",
          path: index > 8 ? "/foo" : "/bar",
          user_id: user.id,
        });
        databases.push(database);
      }

      return { databases, users };
    });

    const firstPage = {
      page_count: 2,
      page: [
        {
          created_at: databases[8].created_at,
          id: databases[8].id,
          kind: databases[8].kind,
          path: databases[8].path,
          updated_at: databases[8].updated_at,
          user_id: users[8].id,
        },
        {
          created_at: databases[9].created_at,
          id: databases[9].id,
          kind: databases[9].kind,
          path: databases[9].path,
          updated_at: databases[9].updated_at,
          user_id: users[9].id,
        },
        {
          created_at: databases[10].created_at,
          id: databases[10].id,
          kind: databases[10].kind,
          path: databases[10].path,
          updated_at: databases[10].updated_at,
          user_id: users[10].id,
        },
        {
          created_at: databases[0].created_at,
          id: databases[0].id,
          kind: databases[0].kind,
          path: databases[0].path,
          updated_at: databases[0].updated_at,
          user_id: users[0].id,
        },
        {
          created_at: databases[1].created_at,
          id: databases[1].id,
          kind: databases[1].kind,
          path: databases[1].path,
          updated_at: databases[1].updated_at,
          user_id: users[1].id,
        },
        {
          created_at: databases[2].created_at,
          id: databases[2].id,
          kind: databases[2].kind,
          path: databases[2].path,
          updated_at: databases[2].updated_at,
          user_id: users[2].id,
        },
        {
          created_at: databases[3].created_at,
          id: databases[3].id,
          kind: databases[3].kind,
          path: databases[3].path,
          updated_at: databases[3].updated_at,
          user_id: users[3].id,
        },
        {
          created_at: databases[4].created_at,
          id: databases[4].id,
          kind: databases[4].kind,
          path: databases[4].path,
          updated_at: databases[4].updated_at,
          user_id: users[4].id,
        },
        {
          created_at: databases[5].created_at,
          id: databases[5].id,
          kind: databases[5].kind,
          path: databases[5].path,
          updated_at: databases[5].updated_at,
          user_id: users[5].id,
        },
        {
          created_at: databases[6].created_at,
          id: databases[6].id,
          kind: databases[6].kind,
          path: databases[6].path,
          updated_at: databases[6].updated_at,
          user_id: users[6].id,
        },
      ],
    };
    const secondPage = {
      page_count: 2,
      page: [
        {
          created_at: databases[7].created_at,
          id: databases[7].id,
          kind: databases[7].kind,
          path: databases[7].path,
          updated_at: databases[7].updated_at,
          user_id: users[7].id,
        },
      ],
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
