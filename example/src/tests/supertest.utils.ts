// src/tests/supertest.utils.ts
import supertest, { SuperTest, Test } from "supertest";
import { server } from "../core/server";

export const agent: SuperTest<Test> = supertest(server.build());
