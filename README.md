# Pomo - A Modern Pomodoro Experience


**Pomo** is a beautiful and intuitive Pomodoro timer designed for radical simplicity. It's more than just a timer; it's an intelligent companion that helps you stay focused and manage your tasks with ease. Built with a robust, modern stack, this app is a case study in creating a resilient and decoupled desktop application.

---

## ✨ Key Features

-   **Single-Screen Simplicity:** A clean, clutter-free interface that puts your focus front and center.
-   **Intelligent Mini Player:** A resizable, adaptive "Focus Mini" window that provides at-a-glance timer status without being a distraction.
-   **Background Persistence:** The timer runs in the main process, ensuring it continues uninterrupted even if the UI is closed or crashes.
-   **Integrated Task Management:** Create tasks, assign pomodoro estimates, and track your progress directly within the app.
-   **Productivity Stats:** Visualize your focus sessions, breaks, and completed tasks to stay motivated.
-   **Type-Safe & Resilient:** Built with TypeScript and Zod for robust data validation and error prevention.
-   **Automated Data Migration:** Automatically repairs legacy data on startup to ensure smooth updates and prevent data corruption.

## 🛠️ Tech Stack & Architecture

Pomo is built with a focus on modern desktop application architecture.

-   **Frontend:** React, TypeScript, Tailwind CSS, Framer Motion
-   **Desktop Framework:** Electron
-   **Build Tool:** Vite
-   **State Management:** React Context with custom hooks
-   **Data Persistence:** `electron-store`
-   **Schema Validation:** Zod

### System Architecture

The application is architected to be highly resilient by decoupling the core timer logic from the UI.

1.  **Main Process (`main/`):**
    -   Handles all core application logic, including the `TimerManager`.
    -   Manages native windows, tray, and IPC communication.
    -   The timer runs on a Node.js `setInterval`, making it immune to renderer process crashes or freezes.
2.  **Renderer Process (`renderer/`):**
    -   Built with React, its sole responsibility is to display the UI based on the state it receives from the main process.
    -   It communicates with the main process via a type-safe IPC bridge defined in `shared/`.
3.  **Preload Script (`preload/`):**
    -   Acts as the secure bridge, exposing specific main process functionalities (`window.api`) to the renderer process.

This separation ensures a smooth user experience and reliable timer persistence.

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/pomo.git
    cd pomo
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Development

Run the app in development mode with hot-reloading:

```bash
npm run dev
```

### Build

To create a production-ready executable for your platform:

```bash
# For Windows
npm run build:win

# For macOS
npm run build:mac

# For Linux
npm run build:linux
```

The built application will be available in the `dist/` directory.
