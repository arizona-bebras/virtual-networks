import { TagsController } from "./tags.controller";

const createTagsServiceMock = () => ({
  create: jest.fn(),
  delete: jest.fn(),
  getAllTags: jest.fn(),
  read: jest.fn(),
  update: jest.fn(),
});

describe("TagsController", () => {
  let controller: TagsController;
  let tagsService: ReturnType<typeof createTagsServiceMock>;

  beforeEach(() => {
    tagsService = createTagsServiceMock();
    controller = new TagsController(tagsService as never);
  });

  it("creates a tag scoped to a network", async () => {
    const tag = { color: "green", name: "Backend" } as const;

    await controller.createTag("network-1", tag);

    expect(tagsService.create).toHaveBeenCalledWith(tag, "network-1");
  });

  it("returns all tags for a network with search", async () => {
    const tags = [{ id: "tag-1" }];
    tagsService.getAllTags.mockResolvedValue(tags);

    await expect(controller.getAllTags("network-1", "back")).resolves.toBe(
      tags,
    );
    expect(tagsService.getAllTags).toHaveBeenCalledWith("network-1", "back");
  });

  it("returns a tag by id", async () => {
    const tag = { id: "tag-1" };
    tagsService.read.mockResolvedValue(tag);

    await expect(controller.getTag("tag-1")).resolves.toBe(tag);
    expect(tagsService.read).toHaveBeenCalledWith("tag-1");
  });

  it("updates a tag", async () => {
    const patch = { color: "blue" } as const;

    await controller.updateTag("tag-1", patch);

    expect(tagsService.update).toHaveBeenCalledWith("tag-1", patch);
  });

  it("deletes a tag", async () => {
    await controller.deleteTag("tag-1");

    expect(tagsService.delete).toHaveBeenCalledWith("tag-1");
  });
});
