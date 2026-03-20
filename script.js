const STORAGE_KEY = "prioritized-todos-v1";
const PRIORITY_LABELS = {
  high: "Høy",
  medium: "Middels",
  low: "Lav",
};
const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
};

const form = document.querySelector("#todo-form");
const list = document.querySelector("#todo-list");
const clearCompletedBtn = document.querySelector("#clear-completed");
const template = document.querySelector("#todo-item-template");

let todos = loadTodos();
renderTodos();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const title = String(formData.get("title") ?? "").trim();
  const priority = String(formData.get("priority") ?? "medium");

  if (!title) {
    return;
  }

  todos.push({
    id: crypto.randomUUID(),
    title,
    priority,
    completed: false,
    createdAt: Date.now(),
  });

  persistAndRender();
  form.reset();
});

list.addEventListener("click", (event) => {
  const target = event.target;
  const item = target.closest(".todo-item");

  if (!item) {
    return;
  }

  const todoId = item.dataset.id;

  if (target.classList.contains("delete-btn")) {
    todos = todos.filter((todo) => todo.id !== todoId);
    persistAndRender();
  }
});

list.addEventListener("change", (event) => {
  const target = event.target;

  if (!target.classList.contains("complete-checkbox")) {
    return;
  }

  const item = target.closest(".todo-item");

  if (!item) {
    return;
  }

  const todo = todos.find((task) => task.id === item.dataset.id);

  if (!todo) {
    return;
  }

  todo.completed = target.checked;
  persistAndRender();
});

clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  persistAndRender();
});

function persistAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  renderTodos();
}

function renderTodos() {
  list.innerHTML = "";

  if (todos.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.textContent = "Ingen oppgaver enda. Legg til en oppgave over.";
    emptyState.style.color = "var(--muted)";
    emptyState.style.padding = "0.5rem 0";
    list.append(emptyState);
    return;
  }

  const sortedTodos = [...todos].sort((a, b) => {
    const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (byPriority !== 0) {
      return byPriority;
    }

    return a.createdAt - b.createdAt;
  });

  for (const todo of sortedTodos) {
    const item = template.content.firstElementChild.cloneNode(true);
    item.dataset.id = todo.id;

    const title = item.querySelector(".todo-title");
    const checkbox = item.querySelector(".complete-checkbox");
    const priorityTag = item.querySelector(".todo-priority");

    title.textContent = todo.title;
    checkbox.checked = todo.completed;

    priorityTag.textContent = PRIORITY_LABELS[todo.priority] ?? PRIORITY_LABELS.medium;
    priorityTag.classList.add(todo.priority);

    if (todo.completed) {
      item.classList.add("completed");
    }

    list.append(item);
  }
}

function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (todo) =>
        typeof todo.id === "string" &&
        typeof todo.title === "string" &&
        typeof todo.priority === "string" &&
        typeof todo.completed === "boolean" &&
        typeof todo.createdAt === "number",
    );
  } catch {
    return [];
  }
}
