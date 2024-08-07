import { Link } from "@remix-run/react";

export default function () {
  return (
    <div className="prose p-4">
      <h2>Playground</h2>

      <p>These playground routes are examples for showcasing random use cases, such as:</p>
      <ul>
        <li>
          <Link to="crud">CRUD</Link> example: Routes, Components, DTOs, and Service
        </li>
        <li>
          <Link to="long-running-tasks">Long Running Tasks</Link>: Large operations that take a long time to complete to{" "}
          <a href="https://vercel.com/docs/concepts/limits/overview#general-limits">avoid timeouts</a>
        </li>
        <li>
          <Link to="supabase/storage/buckets/buckets">Supabase Storage</Link>: Buckets and Files
        </li>
        <li>
          <Link to="ai/openai/chatgpt">ChatGPT</Link>: Call the OpenAI ChatGPT API
        </li>
      </ul>

      <p>
        If you want to see more examples, ask for access to the{" "}
        <a href="https://tools.saasrock.com" target="_blank" rel="noreferrer">
          SaasRock Tools
        </a>{" "}
        repository, which is a collection of tools and services that require external dependencies, such as{" "}
        <a href="https://github.com/naptha/tesseract.js/">Tesseract.js</a> for frontend OCR,{" "}
        <a href="https://github.com/hellosign/hellosign-nodejs-sdk">Dropbox Sign</a> <i>(HelloSign)</i> for digital signatures, PDF → Image that requires a{" "}
        <a href="https://github.com/Automattic/node-canvas">canvas</a> dependency (which increases the{" "}
        <a href="https://github.com/orgs/vercel/discussions/103">bundle size in deployments</a> and you could have issues)... that are not fit for the main app.
      </p>
    </div>
  );
}
