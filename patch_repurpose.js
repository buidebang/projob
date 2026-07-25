const fs = require('fs');
const filePath = 'app/api/repurpose/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

// The issue states:
// 1. Completely strip out the await req.json() Base64 expectation for file uploads.
// 2. Convert the endpoint to parse standard multipart/form-data using req.formData().
// 3. Wrap the hashing function (crypto.createHash) in a strict try/catch block. If the file buffer is missing or corrupted, it MUST return a graceful 400 Bad Request JSON response, never an unhandled 500 or a synchronous TypeError.

const diff = `<<<<<<< SEARCH
    const session = await auth();
    const body = await req.json();
    const config = await getSystemConfig();
    const {
      inputText,
      fileBase64,
      fileMimeType,
      platforms,
      tone,
      length,
      flashMode,
      guestMode,
      imageRequest,
        orchestrationMode,
    } = body;
=======
    const session = await auth();
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (e) {
      return NextResponse.json({ error: "Invalid multipart/form-data payload" }, { status: 400 });
    }
    const config = await getSystemConfig();

    const inputText = formData.get('inputText')?.toString() || "";
    const fileBase64 = formData.get('fileBase64')?.toString() || "";
    const fileMimeType = formData.get('fileMimeType')?.toString() || "";
    const platforms = formData.get('platforms') ? JSON.parse(formData.get('platforms')?.toString() || "[]") : [];
    const tone = formData.get('tone')?.toString();
    const length = formData.get('length')?.toString();
    const flashMode = formData.get('flashMode') === "true";
    const guestMode = formData.get('guestMode') === "true";
    const imageRequest = formData.get('imageRequest') === "true";
    const orchestrationMode = formData.get('orchestrationMode')?.toString();
>>>>>>> REPLACE`;

const searchStr = diff.split('<<<<<<< SEARCH\n')[1].split('\n=======\n')[0];
const replaceStr = diff.split('\n=======\n')[1].split('\n>>>>>>> REPLACE')[0];

if (code.includes(searchStr)) {
    code = code.replace(searchStr, replaceStr);
} else {
    console.log("Block 1 not found");
}

const diff2 = `<<<<<<< SEARCH
    const lookupFingerprint = crypto
      .createHash("sha256")
      .update(
        \`\${cleanText}_\${fileBase64?.substring(0, 400) || "no_file"}_\${platforms.join(",")}_\${flashMode}\`,
      )
      .digest("hex");
=======
    let lookupFingerprint = "";
    try {
      lookupFingerprint = crypto
        .createHash("sha256")
        .update(
          \`\${cleanText}_\${fileBase64?.substring(0, 400) || "no_file"}_\${platforms.join(",")}_\${flashMode}\`,
        )
        .digest("hex");
    } catch (e) {
      return NextResponse.json({ error: "Invalid payload format for hashing." }, { status: 400 });
    }
>>>>>>> REPLACE`;

const searchStr2 = diff2.split('<<<<<<< SEARCH\n')[1].split('\n=======\n')[0];
const replaceStr2 = diff2.split('\n=======\n')[1].split('\n>>>>>>> REPLACE')[0];

if (code.includes(searchStr2)) {
    code = code.replace(searchStr2, replaceStr2);
} else {
    console.log("Block 2 not found");
}


fs.writeFileSync(filePath, code, 'utf8');
