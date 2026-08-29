/**
 * Minimal MD5 (RFC 1321) implementation, since the browser's native
 * Web Crypto API deliberately does not implement MD5. Exposes md5(string) -> hex.
 */
(function (global) {
  "use strict";

  function rotl(x, c) {
    return (x << c) | (x >>> (32 - c));
  }

  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);

  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];

  function md5(message) {
    const bytes = new TextEncoder().encode(message);
    const origLenBits = bytes.length * 8;

    // Pad: 0x80, then zeros, until length % 64 === 56, then 8 bytes of length.
    let padded = Array.from(bytes);
    padded.push(0x80);
    while (padded.length % 64 !== 56) padded.push(0);
    for (let i = 0; i < 8; i++) {
      padded.push(i < 4 ? (origLenBits >>> (8 * i)) & 0xff : 0);
    }

    let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

    for (let chunkStart = 0; chunkStart < padded.length; chunkStart += 64) {
      const M = new Uint32Array(16);
      for (let i = 0; i < 16; i++) {
        M[i] =
          padded[chunkStart + i * 4] |
          (padded[chunkStart + i * 4 + 1] << 8) |
          (padded[chunkStart + i * 4 + 2] << 16) |
          (padded[chunkStart + i * 4 + 3] << 24);
      }

      let A = a0, B = b0, C = c0, D = d0;

      for (let i = 0; i < 64; i++) {
        let F, g;
        if (i < 16) {
          F = (B & C) | (~B & D);
          g = i;
        } else if (i < 32) {
          F = (D & B) | (~D & C);
          g = (5 * i + 1) % 16;
        } else if (i < 48) {
          F = B ^ C ^ D;
          g = (3 * i + 5) % 16;
        } else {
          F = C ^ (B | ~D);
          g = (7 * i) % 16;
        }
        F = (F + A + K[i] + M[g]) | 0;
        A = D;
        D = C;
        C = B;
        B = (B + rotl(F, S[i])) | 0;
      }

      a0 = (a0 + A) | 0;
      b0 = (b0 + B) | 0;
      c0 = (c0 + C) | 0;
      d0 = (d0 + D) | 0;
    }

    const toHexLE = (n) => {
      const bytes = [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
      return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
    };

    return toHexLE(a0) + toHexLE(b0) + toHexLE(c0) + toHexLE(d0);
  }

  global.md5 = md5;
})(window);
