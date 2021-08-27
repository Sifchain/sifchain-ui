async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  console.log(msgUint8);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  alert(hashHex);
}

// `port/denomTrace/baseDenom`
digestMessage("transfer/channel-86/rowan").then((digestHex) =>
  console.log(digestHex),
);
