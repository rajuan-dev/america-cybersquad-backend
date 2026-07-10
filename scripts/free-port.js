const { execSync, spawnSync } = require("child_process");
const path = require("path");

require("dotenv").config({ path: path.join(process.cwd(), ".env") });

const port = Number(process.env.PORT) || 5000;

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function killPid(pid) {
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(pid), "/F"], {
      stdio: "inherit",
    });
    return;
  }

  spawnSync("kill", ["-9", String(pid)], {
    stdio: "inherit",
  });
}

function getListeningPids() {
  try {
    if (process.platform === "win32") {
      const output = execSync(`netstat -ano -p tcp | findstr :${port}`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        shell: true,
      });

      const pids = output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => /LISTENING/i.test(line))
        .map((line) => {
          const parts = line.split(/\s+/);
          return parts[parts.length - 1];
        })
        .filter((pid) => /^\d+$/.test(pid))
        .map(Number);

      return unique(pids);
    }

    const output = execSync(`lsof -ti tcp:${port}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      shell: true,
    });

    return unique(
      output
        .split(/\r?\n/)
        .map((pid) => Number(pid.trim()))
        .filter((pid) => Number.isInteger(pid) && pid > 0)
    );
  } catch {
    return [];
  }
}

const pids = getListeningPids();

if (pids.length === 0) {
  console.log(`[dev] Port ${port} is free.`);
  process.exit(0);
}

console.log(`[dev] Freeing port ${port} from PID(s): ${pids.join(", ")}`);

for (const pid of pids) {
  killPid(pid);
}

console.log(`[dev] Port ${port} is ready.`);
