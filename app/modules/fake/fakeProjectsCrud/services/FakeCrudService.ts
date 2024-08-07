import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { FakeProjectDto } from "../dtos/FakeProjectDto";
import { FakeTaskDto } from "../dtos/FakeTaskDto";

export namespace FakeProjectService {
  let fakeData: FakeProjectDto[] = [];
  async function generateFakeData(waitMiliseconds: number) {
    await new Promise((resolve) => setTimeout(resolve, waitMiliseconds));
    if (fakeData.length > 0) {
      return fakeData;
    }
    for (let i = 0; i < 100; i++) {
      fakeData.push({
        id: (i + 1).toString(),
        name: "Project " + (i + 1),
        description: "Description lorem ipsum dolor sit amet " + (i + 1),
        createdAt: new Date(),
        active: i % 2 === 0,
        tasks: [],
      });
      for (let idxSubItem = 0; idxSubItem < 2; idxSubItem++) {
        fakeData[i].tasks.push({
          id: (idxSubItem + 1).toString(),
          name: "Task lorem ipsum dolor sit amet #" + (idxSubItem + 1),
          completed: idxSubItem % 2 === 0,
        });
      }
    }
    return fakeData;
  }
  export async function getAll({
    filters,
    pagination,
  }: {
    filters?: { name?: string };
    pagination: { page: number; pageSize: number };
  }): Promise<{ items: FakeProjectDto[]; pagination: PaginationDto }> {
    await generateFakeData(500);
    let filteredItems = fakeData;
    if (filters?.name) {
      filteredItems = filteredItems.filter((x) => x.name.toLowerCase().includes(filters?.name?.toLowerCase() ?? ""));
    }
    const items = filteredItems.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize);
    const totalItems = fakeData.length;
    return {
      items,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pagination.pageSize),
      },
    };
  }
  export async function get(id: string): Promise<FakeProjectDto | null> {
    await generateFakeData(500);
    const item = fakeData.find((x) => x.id === id);
    if (!item) {
      return null;
    }
    return item;
  }
  export async function create(data: { name: string; description?: string; active: boolean; tasks: Partial<FakeTaskDto>[] }): Promise<FakeProjectDto> {
    await generateFakeData(500);
    const newItem: FakeProjectDto = {
      id: fakeData.length + 1 + "",
      name: data.name,
      description: data.description,
      createdAt: new Date(),
      active: data.active,
      tasks: data.tasks.map((t, idx) => {
        return {
          id: t.id ?? (fakeData.length + 1).toString(),
          name: t.name ?? "Task " + (idx + 1),
          completed: t.completed ?? false,
        };
      }),
    };
    fakeData.push(newItem);
    return newItem;
  }
  export async function update(
    id: string,
    data: { name?: string; description?: string; active?: boolean; tasks?: Partial<FakeTaskDto>[] }
  ): Promise<FakeProjectDto> {
    await generateFakeData(500);
    const item = fakeData.find((x) => x.id === id);
    if (!item) {
      throw Error("Project not found with ID: " + id);
    }
    if (data.name !== undefined) {
      item.name = data.name;
    }
    if (data.description !== undefined) {
      item.description = data.description;
    }
    if (data.active !== undefined) {
      item.active = data.active;
    }
    if (data.tasks !== undefined) {
      item.tasks = data.tasks.map((t, idx) => {
        return {
          id: t.id ?? (fakeData.length + 1).toString(),
          name: t.name ?? "Task " + (idx + 1),
          completed: t.completed ?? false,
        };
      });
    }

    return item;
  }
  export async function del(id: string): Promise<void> {
    await generateFakeData(500);
    const index = fakeData.findIndex((x) => x.id === id);
    if (index === -1) {
      throw Error("Project not found with ID: " + id);
    }
    fakeData.splice(index, 1);
  }
  export async function completeTask(id: string, taskId: string): Promise<void> {
    await generateFakeData(500);
    const item = fakeData.find((x) => x.id === id);
    if (!item) {
      throw Error("Project not found with ID: " + id);
    }
    const task = item.tasks.find((x) => x.id === taskId);
    if (!task) {
      throw Error("Task not found with ID: " + taskId);
    }
    task.completed = true;
    fakeData = fakeData.map((x) => (x.id === id ? item : x));
  }
}
