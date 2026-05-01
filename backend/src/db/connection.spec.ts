const ORIGINAL_ENV = process.env;

jest.mock("dotenv/config", () => ({}));

const loadConnection = () => {
  jest.resetModules();
  return jest.requireActual<typeof import("./connection")>("./connection");
};

describe("database connection config", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.POSTGRES_DB;
    delete process.env.POSTGRES_HOST;
    delete process.env.POSTGRES_PASSWORD;
    delete process.env.POSTGRES_PORT;
    delete process.env.POSTGRES_USER;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("uses local Postgres defaults when env vars are absent", () => {
    const { postgresConfig, postgresUrl } = loadConnection();

    expect(postgresConfig).toEqual({
      database: "postgres",
      host: "localhost",
      password: "",
      port: 5432,
      user: "postgres",
    });
    expect(postgresUrl).toBe("postgresql://postgres:@localhost:5432/postgres");
  });

  it("builds a Postgres URL from env vars", () => {
    process.env.POSTGRES_DB = "virtual_networks";
    process.env.POSTGRES_HOST = "db";
    process.env.POSTGRES_PASSWORD = "pass";
    process.env.POSTGRES_PORT = "5433";
    process.env.POSTGRES_USER = "app";

    const { postgresConfig, postgresUrl } = loadConnection();

    expect(postgresConfig).toEqual({
      database: "virtual_networks",
      host: "db",
      password: "pass",
      port: 5433,
      user: "app",
    });
    expect(postgresUrl).toBe("postgresql://app:pass@db:5433/virtual_networks");
  });
});
