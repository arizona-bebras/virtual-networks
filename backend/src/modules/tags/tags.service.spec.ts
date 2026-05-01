import * as schema from "../../db/schema";
import { TagsService } from "./tags.service";

const createDbMock = () => ({
  delete: jest.fn(),
  insert: jest.fn(),
  query: {
    tags: {
      findFirst: jest.fn(),
    },
  },
  select: jest.fn(),
  update: jest.fn(),
});

describe("TagsService", () => {
  let db: ReturnType<typeof createDbMock>;
  let service: TagsService;

  beforeEach(() => {
    db = createDbMock();
    service = new TagsService(db as never);
  });

  it("creates a tag scoped to a network", async () => {
    const values = jest.fn().mockResolvedValue(undefined);
    db.insert.mockReturnValue({ values });

    const tag = { color: "green", name: "Backend" } as const;

    await service.create(tag, "network-1");

    expect(db.insert).toHaveBeenCalledWith(schema.tags);
    expect(values).toHaveBeenCalledWith({ ...tag, networkId: "network-1" });
  });

  // it("reads one tag by id", async () => {
  //   const tag = { id: "tag-1" };
  //   db.query.tags.findFirst.mockResolvedValue(tag);

  //   await expect(service.read("tag-1")).resolves.toBe(tag);
  //   expect(db.query.tags.findFirst).toHaveBeenCalledWith({
  //     where: { id: "tag-1" },
  //   });
  // });

  // it("reads tags ordered by name when there is no search query", async () => {
  //   const tags = [{ id: "tag-1", name: "Backend" }];
  //   const orderBy = jest.fn().mockResolvedValue(tags);
  //   const where = jest.fn().mockReturnValue({ orderBy });
  //   const from = jest.fn().mockReturnValue({ where });
  //   db.select.mockReturnValue({ from });

  //   await expect(service.getAllTags("network-1")).resolves.toBe(tags);

  //   expect(db.select).toHaveBeenCalledWith();
  //   expect(from).toHaveBeenCalledWith(schema.tags);
  //   expect(where).toHaveBeenCalled();
  //   expect(orderBy).toHaveBeenCalledWith(schema.tags.name);
  // });

  // it("orders tags by similarity when searching", async () => {
  //   const tags = [{ id: "tag-1", name: "Backend" }];
  //   const orderBy = jest.fn().mockResolvedValue(tags);
  //   const where = jest.fn().mockReturnValue({ orderBy });
  //   const from = jest.fn().mockReturnValue({ where });
  //   db.select.mockReturnValue({ from });

  //   await expect(service.getAllTags("network-1", "back")).resolves.toBe(tags);

  //   expect(where).toHaveBeenCalled();
  //   expect(orderBy).toHaveBeenCalledWith(expect.anything());
  // });

  // it("updates a tag by id", async () => {
  //   const where = jest.fn().mockResolvedValue(undefined);
  //   const set = jest.fn().mockReturnValue({ where });
  //   db.update.mockReturnValue({ set });

  //   const patch = { color: "blue" } as const;

  //   await service.update("tag-1", patch);

  //   expect(db.update).toHaveBeenCalledWith(schema.tags);
  //   expect(set).toHaveBeenCalledWith(patch);
  //   expect(where).toHaveBeenCalled();
  // });

  // it("deletes a tag by id", async () => {
  //   const where = jest.fn().mockResolvedValue(undefined);
  //   db.delete.mockReturnValue({ where });

  //   await service.delete("tag-1");

  //   expect(db.delete).toHaveBeenCalledWith(schema.tags);
  //   expect(where).toHaveBeenCalled();
  // });
});
