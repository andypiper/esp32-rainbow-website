# Data Generation Scripts

This directory contains scripts for generating JSON data files from the ZXDB SQLite database.

## Data Source

The SQLite database (`zxdb.sqlite`) is sourced from the [ZXDB Project](https://github.com/zxdb/ZXDB), which is a comprehensive database of ZX Spectrum software. The database includes information about games, utilities, and other software, along with their associated files and metadata.

## Main Script

- `generate_entries_json.py` - Generates paginated JSON data files from the ZXDB database
- `zxdb.sqlite` - Source database file (not included in repository)

## Generated Data Structure

The script generates a paginated data structure in the `public/data/` directory:

```
public/data/
├── index.json           # Global index of all entries
├── A/                   # Directory for entries starting with 'A'
│   ├── info.json       # Contains pagination info
│   ├── 1.json          # First page of entries
│   ├── 2.json          # Second page of entries
│   └── ...             # Additional pages
├── B/                  # Directory for entries starting with 'B'
│   ├── info.json
│   ├── 1.json
│   └── ...
└── _/                  # Directory for entries starting with numbers/symbols
    ├── info.json
    ├── 1.json
    └── ...
```

### File Details

#### index.json
Contains a list of all entries with minimal information and navigation details:
```json
[
  {
    "i": 1234,      // id
    "t": "Game Title", // title
    "l": "G",       // letter directory where details can be found
    "p": 3          // page number within that letter's directory
  }
]
```

This structure allows for direct navigation to an entry's details:
1. The `l` field indicates which letter directory contains the entry
2. The `p` field indicates which page file contains the entry
3. Example: For an entry with `"l": "G", "p": 3`, the details would be in `/data/G/3.json`

#### letter/info.json
Contains pagination information for each letter:
```json
{"p": 5}  // Indicates 5 pages total
```

#### letter/[page].json
Contains detailed entry information for 50 entries per page:
```json
[
  {
    "i": 1234,          // id
    "t": "Game Title",  // title
    "g": "Adventure",   // genre
    "m": "ZX Spectrum", // machine
    "f": [             // files
      {
        "l": "/path/to/file", // link
        "y": "Tape image",    // type
        "s": 12345           // size
      }
    ]
  }
]
```

### Key Mappings

To minimize file sizes, the JSON uses shortened key names:

| Short Key | Full Name |
|-----------|-----------|
| i | id |
| t | title |
| g | genre |
| m | machine |
| f | files |
| l | link |
| y | type |
| s | size |
| p | pages |

### Pagination

- Each letter directory contains multiple page files
- Each page contains 50 entries
- Pages are numbered starting from 1
- Entries are sorted alphabetically by title within each page
- The `info.json` file in each letter directory contains the total number of pages

### Special Cases

- Entries starting with numbers or symbols are stored in the `_` directory
- All text entries are case-insensitive for sorting purposes
- File sizes are in bytes