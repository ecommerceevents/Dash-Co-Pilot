import { describe, it, vi, expect } from 'vitest';
import emailTemplates from "./emailTemplates.server";
import { EmailTemplate } from "../dtos/email/EmailTemplate";
import fs from "fs";
import path from 'path'

const mockEmailTemplates: EmailTemplate[] = [
  {
    type: "standard",
    name: "template-1",
    alias: "template-1-alias",
    subject: "template-1-subject",
    htmlBody: "<p>template-1-body</p>",
    active: false,
    associatedServerId: -1,
    templateId: -1,
  },
 
];

// Mock fs
fs.readdirSync = vi.fn().mockReturnValueOnce(["template-1.md", ]);
fs.readFileSync = vi.fn().mockReturnValueOnce(`
alias: \`template-1-alias\`

subject: \`template-1-subject\`

body: \`<p>template-1-body</p>\`
`)

// Mock path
path.join = vi.fn().mockResolvedValue("./public/emails");
path.parse = vi.fn().mockReturnValue({ name: "template-1", ext: ".md" })

describe("emailTemplates", () => {
  it("should return an array of email templates", async () => {
    const result = await emailTemplates();
    expect(result).toEqual(mockEmailTemplates);
  });
});
