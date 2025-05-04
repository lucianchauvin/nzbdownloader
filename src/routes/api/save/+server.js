import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const body = await request.json();
  const downloadUrl = body.downloadUrl;

  if (!downloadUrl) {
    return new Response(
      JSON.stringify({ message: 'No download URL provided' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const command = `./sabcmd/sabcmd add --nzb "${downloadUrl}"`;

  try {
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return new Response(
        JSON.stringify({ message: 'Failed to execute SABnzbd command' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`stdout: ${stdout}`);
    return new Response(
      JSON.stringify({ message: 'NZB added to SABnzbd successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error(`Error executing command: ${err.message}`);
    return new Response(
      JSON.stringify({ message: 'Failed to execute SABnzbd command' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
