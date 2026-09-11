/*
 * Create and assign the tasks from docs/03-product/taiga.md in Taiga.
 * Requires Node.js 18+ for the built-in fetch API.
 */

const fs = require("node:fs/promises");

const TAIGA_URL = (process.env.TAIGA_URL || "https://api.taiga.io").replace(
  /\/$/,
  "",
);
const PROJECT_ID = Number(process.env.TAIGA_PROJECT_ID);
const USERNAME = process.env.TAIGA_USERNAME;
const PASSWORD = process.env.TAIGA_PASSWORD;
const TASK_STATUS_NAME = process.env.TAIGA_TASK_STATUS || "New";

const memberNames = {
  Trinh: process.env.TAIGA_TRINH_USERNAME || "Trinh",
  Thơ: process.env.TAIGA_THO_USERNAME || "Thơ",
};

const mixedOwnerOverrides = new Map([
  ["T-205", "Trinh"],
  ["T-209", "Trinh"],
  ["T-307", "Trinh"],
  ["T-408", "Trinh"],
  ["T-409", "Trinh"],
  ["T-508", "Trinh"],
  ["T-705", "Thơ"],
]);

function requireConfig() {
  const missing = [
    ["TAIGA_PROJECT_ID", PROJECT_ID],
    ["TAIGA_USERNAME", USERNAME],
    ["TAIGA_PASSWORD", PASSWORD],
  ].filter(
    ([, value]) =>
      !value || (typeof value === "number" && !Number.isInteger(value)),
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing configuration: ${missing.map(([name]) => name).join(", ")}`,
    );
  }
}

async function request(path, options = {}, token) {
  const response = await fetch(`${TAIGA_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const body = await response.text();
  let data;
  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    data = body;
  }

  if (!response.ok) {
    throw new Error(
      `${options.method || "GET"} ${path} failed (${response.status}): ${JSON.stringify(data)}`,
    );
  }

  return data;
}

async function getAll(path, token) {
  const separator = path.includes("?") ? "&" : "?";
  return request(`${path}${separator}page=1&page_size=100`, {}, token);
}

function parseTasks(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => /^\| US-AI-/.test(line))
    .map((line) => {
      const columns = line.split("|").map((column) => column.trim());
      const [, storyRef, taskId, title, owner, estimate] = columns;
      return {
        storyRef,
        taskId,
        title,
        owner,
        estimate: Number.parseInt(estimate, 10),
      };
    });
}

function ownerForTask(task) {
  if (mixedOwnerOverrides.has(task.taskId)) {
    return mixedOwnerOverrides.get(task.taskId);
  }

  return /UI\/UX|FE|QA/.test(task.owner) ? "Thơ" : "Trinh";
}

function findByName(items, name, label) {
  const normalizedName = name.toLocaleLowerCase("vi");
  const matches = items.filter((item) =>
    [item.username, item.full_name, item.name]
      .filter(Boolean)
      .some((value) => value.toLocaleLowerCase("vi") === normalizedName),
  );

  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one ${label} matching "${name}", found ${matches.length}`,
    );
  }

  return matches[0];
}

function parseStoryTitles(markdown) {
  return new Map(
    markdown
      .split(/\r?\n/)
      .filter((line) => /^\| EP\d+/.test(line))
      .map((line) => {
        const columns = line.split("|").map((column) => column.trim());
        return [columns[3], columns[4]];
      }),
  );
}

function findStory(stories, storyRef, storyTitles) {
  const expectedTitle = storyTitles.get(storyRef)?.toLocaleLowerCase("vi");
  const story = stories.find((item) => {
    const subject = `${item.subject}`.toLocaleLowerCase("vi");
    return (
      subject.includes(storyRef.toLocaleLowerCase("vi")) ||
      subject === expectedTitle
    );
  });
  if (!story) {
    throw new Error(
      `Could not find Taiga User Story with reference ${storyRef}`,
    );
  }
  return story;
}

async function main() {
  requireConfig();

  const [markdown, epicsMarkdown] = await Promise.all([
    fs.readFile("docs/03-product/taiga.md", "utf8"),
    fs.readFile("docs/03-product/epics.md", "utf8"),
  ]);
  const tasks = parseTasks(markdown);
  const storyTitles = parseStoryTitles(epicsMarkdown);
  const auth = await request("/api/v1/auth", {
    method: "POST",
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });
  const token = auth.auth_token;

  const [stories, existingTasks, statuses, users] = await Promise.all([
    getAll(`/api/v1/userstories?project=${PROJECT_ID}`, token),
    getAll(`/api/v1/tasks?project=${PROJECT_ID}`, token),
    getAll(`/api/v1/task-statuses?project=${PROJECT_ID}`, token),
    getAll(`/api/v1/users?project=${PROJECT_ID}`, token),
  ]);

  const status = findByName(statuses, TASK_STATUS_NAME, "task status");
  const assignees = {
    Trinh: findByName(users, memberNames.Trinh, "member Trinh"),
    Thơ: findByName(users, memberNames["Thơ"], "member Thơ"),
  };

  let created = 0;
  let skipped = 0;
  for (const task of tasks) {
    const subject = `[${task.taskId}] ${task.title}`;
    if (existingTasks.some((item) => item.subject === subject)) {
      skipped += 1;
      console.log(`SKIP ${subject}`);
      continue;
    }

    const owner = ownerForTask(task);
    const story = findStory(stories, task.storyRef, storyTitles);
    await request(
      "/api/v1/tasks",
      {
        method: "POST",
        body: JSON.stringify({
          project: PROJECT_ID,
          user_story: story.id,
          subject,
          assigned_to: assignees[owner].id,
          status: status.id,
          description: `Owner: ${owner}\nEstimate: ${task.estimate}h\nOriginal role: ${task.owner}`,
        }),
      },
      token,
    );
    created += 1;
    console.log(`CREATE ${subject} -> ${owner}`);
  }

  console.log(
    `Done. Created: ${created}; skipped: ${skipped}; total: ${tasks.length}`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
