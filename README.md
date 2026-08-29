<div align="center">

```
______                                _____                      _
|  _  \                              /  __ \                    | |
| | | |  ___   ___   ___   ___   ___ | /  \/ _ __  _   _  _ __  | |_   ___   _ __
| | | | / _ \ / _ \ / _ \ / _ \ / _ \| |    | '__|| | | || '_ \ | __| / _ \ | '__|
| |/ / |  __/|  __/|  __/|  __/|  __/| \__/\| |   | |_| || |_) || |_ | (_) || |
|___/   \___| \___| \___| \___| \___| \____/|_|    \__, || .__/  \__| \___/ |_|
                                                    __/ || |
                                                   |___/ |_|
```

### 🔐 *Decode anything. Crack every hash. Win every CTF.*

<br/>

[![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](#-installation)
[![Firefox](https://img.shields.io/badge/Firefox-Add--on-FF7139?style=for-the-badge&logo=firefox-browser&logoColor=white)](#-installation)
[![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen?style=for-the-badge)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Offline-4fd6be?style=for-the-badge&logo=shield&logoColor=white)]()

<br/>

**[✨ Features](#-features) · [⚡ Install](#-installation) · [🚀 Usage](#-usage) · [🔣 Decoders](#-supported-decoders--ciphers) · [🔒 Hashes](#-hash-support) · [🛡️ Privacy](#-privacy)**

<br/>

</div>

---

<br/>

> **DeeeeeCryptor** is a browser extension built for CTF players and security researchers.  
> Paste any encoded string or hash, hit a button — get your answer **instantly**, entirely in your browser.  
> No accounts. No servers. No nonsense.

<br/>

---

## ✨ Features

<br/>

|  | Feature | Description |
|:---:|---|---|
| ✨ | **Magic Auto-Solve** | Paste anything unknown — it tries every decoder at once and ranks results by plausibility |
| 🔣 | **13 Decoders** | Base64, Base64URL, Base32, Base58, Hex, Binary, ROT13/47, Caesar, XOR, Morse, URL, HTML entities |
| 🔍 | **Hash Identification** | Instantly detect MD5, SHA-1/256/512, bcrypt, NTLM and more — offline + Hashes.com API |
| 🔓 | **Hash Cracking** | Built-in offline wordlist cracker + optional Hashes.com remote plaintext lookup |
| 🖱️ | **Context Menu** | Select text on any page → right-click → *"Decode with DeeeeeCryptor"* |
| 🌐 | **Cross-Browser** | Native support for **Chrome** (MV3) and **Firefox** |
| 🛡️ | **100% Private** | Everything runs locally in your browser — zero telemetry, zero tracking |
| ⚡ | **Zero Latency** | No loading screens, no API calls (unless you choose it), no waiting |

<br/>

---

## ⚡ Installation

### 🟦 Chrome / Edge / Chromium

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/deeeeecryptor.git
```

Then in your browser:

1. Go to `chrome://extensions/`
2. Enable **Developer Mode** using the toggle in the top-right corner
3. Click **Load unpacked**
4. Select the cloned `deeeeecryptor/` folder
5. The 🔐 icon will appear in your toolbar

> 📦 *Chrome Web Store listing coming soon*

<br/>

### 🟠 Firefox

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/deeeeecryptor.git
```

Then in Firefox:

1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Navigate into the cloned folder and select `manifest.json`
4. The 🔐 icon will appear in your toolbar

> 📦 *Firefox Add-ons (AMO) listing coming soon*

<br/>

> **Compatibility:** Chrome 116+ · Firefox 109+ · Microsoft Edge · Any MV3-compatible browser

<br/>

---

## 🚀 Usage

### Method 1 — Browser Popup

Click the **🔐 DeeeeeCryptor icon** in your toolbar, switch to the tab you need, paste and go.

<br/>

#### 🔣 Decode Tab

```
┌─────────────────────────────────────────────────────┐
│  input                                              │
│  ┌───────────────────────────────────────────────┐  │
│  │ ZmxhZ3t0aDFzXzFzX3RoM19mbDRnfQ==             │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  [ ✨ Auto-solve (magic) ]        [ clear ]          │
│                                                     │
│  Base64  │ Base64URL │ Base32  │ Base58             │
│  Hex     │ Binary    │ URL     │ HTML ent.          │
│  ROT13   │ ROT47     │ Morse   │ Caesar (all)       │
│                                                     │
│  ╔═══════════════════════════════════════════════╗  │
│  ║ ✅ BASE64           ████████░░ confidence      ║  │
│  ║  flag{th1s_1s_th3_fl4g}                       ║  │
│  ╚═══════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────┘
```

<br/>

#### 🔒 Hash Tab

```
┌─────────────────────────────────────────────────────┐
│  hash                                               │
│  ┌───────────────────────────────────────────────┐  │
│  │ 5f4dcc3b5aa765d61d8327deb882cf99              │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  [ identify ]                                       │
│                                                     │
│  ────────────────────────────────────────────────  │
│                                                     │
│  [ 🔓 crack (local wordlist) ]                      │
│  [ ☁  lookup (Hashes.com)   ]                      │
│                                                     │
│  ╔═══════════════════════════════════════════════╗  │
│  ║ ✅ cracked — password  (MD5)                  ║  │
│  ╚═══════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────┘
```

<br/>

### Method 2 — Right-Click Context Menu

The fastest way to decode without even opening the popup:

1. **Select any suspicious text** on any webpage
2. **Right-click** → *"Decode `<text>` with DeeeeeCryptor"*
3. The popup opens with the selected text **already pre-filled** and ready to solve

<br/>

---

## 🔣 Supported Decoders & Ciphers

| Decoder | Example Input | Output | Notes |
|---|---|---|---|
| **Base64** | `aGVsbG8gd29ybGQ=` | `hello world` | Standard RFC 4648 |
| **Base64URL** | `aGVsbG8td29ybGQ` | `hello-world` | URL-safe, no padding |
| **Base32** | `JBSWY3DPEBLW64TMMQ======` | `hello world` | RFC 4648, uppercase |
| **Base58** | `StV1DL6CwTryKyV` | `hello world` | Bitcoin alphabet |
| **Hex** | `68656c6c6f` | `hello` | With or without `0x` |
| **Binary** | `01101000 01100101` | `he` | Spaced or unspaced |
| **URL Encoding** | `hello%20world%21` | `hello world!` | Percent-encoded |
| **HTML Entities** | `&lt;b&gt;CTF&lt;/b&gt;` | `<b>CTF</b>` | Named & numeric |
| **ROT13** | `uryyb jbeyq` | `hello world` | Letters only |
| **ROT47** | `w6==@ H@C=5` | `hello world` | All printable ASCII |
| **Caesar (brute)** | Any letter cipher | Top 5 shifts ranked | All 25 shifts tried |
| **Morse Code** | `.... . .-.. .-.. ---` | `HELLO` | `/` or newline word sep. |
| **XOR (brute)** | `hex-encoded output` | Ranked candidates | All 256 keys tried |

<br/>

---

## 🔒 Hash Support

### 🔍 Identification

Detected locally using regex heuristics — **no network request needed**:

| Hash Type | Format / Length | Notes |
|---|---|---|
| **MD5** | 32 hex chars | Also matches NTLM (same length) |
| **SHA-1** | 40 hex chars | |
| **SHA-224** | 56 hex chars | |
| **SHA-256** | 64 hex chars | |
| **SHA-384** | 96 hex chars | |
| **SHA-512** | 128 hex chars | |
| **bcrypt** | `$2a$` / `$2b$` prefix | Full bcrypt format |
| **md5crypt** | `$1$` prefix | Apache / Unix crypt |
| **sha256crypt** | `$5$` prefix | Unix crypt |
| **sha512crypt** | `$6$` prefix | Unix crypt |
| **phpass** | `$P$` prefix | WordPress, phpBB |
| **MySQL 4.1+** | `*` + 40 hex | SHA1-based |
| **CRC32** | 8 hex chars | |
| **LM/NTLM pair** | `32hex:32hex` | Windows auth pair |

> Additionally queries the **Hashes.com free identifier API** for broader coverage — no key required.

<br/>

### 🔓 Cracking

**🖥️ Local (fully offline)**

A curated wordlist of the most common real-world passwords, automatically expanded with:

| Mutation | Example |
|---|---|
| Base word | `password` |
| Capitalized | `Password` |
| Uppercase | `PASSWORD` |
| Leet-speak | `p4ssw0rd` |
| Common suffixes | `password123`, `password!`, `password2024` |

Supports cracking: **MD5 · SHA-1 · SHA-256 · SHA-512**

<br/>

**☁️ Remote (Hashes.com)**

Optionally queries Hashes.com's cracked-hash database using your own API key.  
Only the **hash** is ever transmitted — never any plaintext.  
See [Configuration](#-configuration) to set up your key.

<br/>

---

## ✨ Magic Mode — How It Works

Magic Mode runs **every decoder simultaneously** on your input and scores each result:

```
Input  →  try all 13 decoders in parallel
       →  score each result:
              printable_ratio × 5          (must be >85% printable ASCII)
            + english_word_hits × 2        (common words boost the score)
            + flag_pattern_bonus × 10      (flag{...} / ctf{...} jackpot)
       →  sort by score, show top 6
       →  🥇 best match highlighted at the top
```

**Example:**

| Input | Magic Output |
|---|---|
| `ZmxhZ3t0aDFzXzFzX3RoM19mbDRnfQ==` | 🥇 `flag{th1s_1s_th3_fl4g}` via Base64 |
| `01100110 01101100 01100001 01100111` | 🥇 `flag` via Binary |
| `666c6167` | 🥇 `flag` via Hex |
| `MZWGCZ3SMF2CA===` | 🥇 `flag123` via Base32 |

<br/>

---

## ⚙️ Configuration

Most features require **zero configuration**. The one optional setup is:

### Hashes.com API Key

Required only for **remote hash plaintext lookup** (identification is always free):

1. Register at [hashes.com](https://hashes.com) and purchase search credits
2. In the extension, go to the **About** tab → click **⚙ Configure Hashes.com API key**
3. Paste your key and click **Save**

> Your key is stored in local browser storage and is sent **only to Hashes.com** — never to us or anyone else.

<br/>

---

## 🛡️ Privacy

We take privacy seriously. Here's exactly what gets sent where:

| Action | Data Sent? | Destination |
|---|:---:|---|
| Decode / Auto-solve | ❌ Never | Runs 100% in your browser |
| Hash identification (local) | ❌ Never | Runs 100% in your browser |
| Hash identification (Hashes.com) | ✅ Hash only | hashes.com (free, no key) |
| Hash cracking (local wordlist) | ❌ Never | Runs 100% in your browser |
| Hash cracking (Hashes.com) | ✅ Hash only | hashes.com (your API key) |

<br/>

> 🔒 **No telemetry. No analytics. No tracking. No ads. Ever.**

<br/>

---

## 🗂️ Project Structure

```
deeeeecryptor/
│
├── 📄 manifest.json           # Extension manifest (Manifest V3)
├── 📄 background.js           # Service worker — context menu & badge logic
│
├── 📄 popup.html              # Main popup UI shell
├── 📄 popup.css               # Dark terminal theme (orange & teal on black)
├── 📄 popup.js                # UI controller — tabs, events, rendering
│
├── 📄 options.html            # Options page (API key management)
├── 📄 options.js              # Options page logic
│
├── 📁 lib/
│   ├── 📄 decoders.js         # All decoders + Magic auto-solve engine
│   ├── 📄 hashid.js           # Hash identification (local patterns + Hashes.com)
│   ├── 📄 hashlookup.js       # Hash cracking (local wordlist + Hashes.com)
│   ├── 📄 md5.js              # Pure-JS MD5 (Web Crypto API omits MD5 intentionally)
│   └── 📄 wordlist.js         # Built-in password list + mutation generator
│
└── 📁 icons/
    ├── 🖼️ icon16.png
    ├── 🖼️ icon48.png
    └── 🖼️ icon128.png
```

<br/>

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

### Ideas for future improvements

- 🔤 More decoders — Base85, UUencode, Bacon cipher, Vigenère, Atbash, A1Z26
- 📖 Larger wordlist — compressed RockYou subset or common CTF passwords
- 🔗 Decoder chaining — pipe the output of one decoder into the next automatically
- 📋 History — remember your last N decoded inputs per session
- 🎨 UI enhancements — copy all results button, export as text
- 🧪 Unit tests for the decoder library
- 🌍 Publish to Chrome Web Store & Firefox AMO

### How to contribute

```bash
# Fork the repo, then:
git clone https://github.com/yourusername/deeeeecryptor.git
cd deeeeecryptor

# Make your changes, load the extension as unpacked, test it
# Then open a pull request 🎉
```

<br/>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for full details.

<br/>

---

<div align="center">

<br/>

Built with ❤️ for the CTF community

*If this tool helped you capture a flag, leave a ⭐ — it means a lot!*

<br/>

**[⬆ Back to top](#)**

</div>
