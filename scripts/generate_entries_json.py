#!/usr/bin/env python3

import sqlite3
import json
from typing import List, Dict, Any
from pathlib import Path
import string
import math
from xml.etree import ElementTree as ET
from datetime import datetime
import shutil
import gzip

# Key mappings for shorter JSON output
KEY_MAPPINGS = {
    "id": "i",
    "title": "t",
    "genre": "g",
    "machine": "m",
    "files": "f",
    "link": "l",
    "type": "y",
    "size": "s",
    "score": "sc",
    "pages": "p"  # Added for pagination info
}

ITEMS_PER_PAGE = 50

def fetch_data(db_path: str) -> List[tuple]:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    query = """
    select distinct
        e.id id, 
        title,
        gt.text genre,
        mt.text machine,
        file_link,
        file_size,
        ft.text file_type
    from 
        entries e
        inner join genretypes gt on e.genretype_id = gt.id
        inner join machinetypes mt on e.machinetype_id = mt.id
        inner join downloads d on e.id = d.entry_id
        inner join filetypes ft on ft.id = d.filetype_id
    where
        machine like 'ZX-Spectrum%'
        AND is_xrated = 0
        AND (
            genre like 'Adventure Game%'
            OR genre like 'Arcade Game%'
            OR genre like 'Compilation%'
            OR genre like 'Covertape%'
            OR genre like 'Demoscene%'
            OR genre like 'Game%'
            OR genre like 'General%'
            OR genre like 'Programming%'
            OR genre like 'Sport Game%'
            OR genre like 'Strategy Game%'
            OR genre like 'Tech Demo%'
            OR genre like 'Utility%'
        )
        AND e.id IN (
            SELECT DISTINCT entry_id 
            FROM downloads 
            WHERE file_link LIKE '%.z80.zip'
               OR file_link LIKE '%.tap.zip'
               OR file_link LIKE '%.tzx.zip'
        )
    order by e.id
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()
    print(f"Fetched {len(rows)} rows")
    return rows

def fetch_scores(db_path: str) -> List[tuple]:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    query = "select entry_id, score from scores"
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()
    print(f"Fetched {len(rows)} scores")
    return rows

def transform_data(rows: List[tuple], scores: List[tuple]) -> Dict[str, Any]:
    # create a quick lookup for scores by entry_id
    score_lookup = {score[0]: score[1] for score in scores}
    
    # Dictionary to store entries by first letter
    entries_by_letter = {}
    # List for the index
    index_entries = []
    
    # Group the results by entry ID first
    entries_dict = {}
    for row in rows:
        entry_id, title, genre, machine, file_link, file_size, file_type = row
        
        if entry_id not in entries_dict:
            entries_dict[entry_id] = {
                KEY_MAPPINGS["id"]: entry_id,
                KEY_MAPPINGS["title"]: title,
                KEY_MAPPINGS["genre"]: genre,
                KEY_MAPPINGS["machine"]: machine,
                KEY_MAPPINGS["score"]: score_lookup.get(entry_id, 0),
                KEY_MAPPINGS["files"]: [],
            }
            
            # Determine which letter file this entry belongs in
            first_char = title[0].upper()
            if first_char in string.ascii_uppercase:
                letter_key = first_char
            else:
                letter_key = '_'
                
            if letter_key not in entries_by_letter:
                entries_by_letter[letter_key] = []
            entries_by_letter[letter_key].append(entries_dict[entry_id])
            
            # Add to index with letter information
            index_entries.append({
                KEY_MAPPINGS["id"]: entry_id,
                KEY_MAPPINGS["title"]: title,
                "l": letter_key,  # Add letter key
            })
        
        entries_dict[entry_id][KEY_MAPPINGS["files"]].append({
            KEY_MAPPINGS["link"]: file_link,
            KEY_MAPPINGS["type"]: file_type,
            KEY_MAPPINGS["size"]: file_size
        })
  
    # Sort index entries by title
    sorted_index = sorted(index_entries, key=lambda x: x[KEY_MAPPINGS["title"]])
    
    # Group index entries by letter and add page numbers
    final_index = []
    letter_counts = {letter: 0 for letter in string.ascii_uppercase + '_'}
    
    for entry in sorted_index:
        letter = entry["l"]
        position_in_letter = letter_counts[letter]
        page_number = (position_in_letter // ITEMS_PER_PAGE) + 1
        
        final_index.append({
            KEY_MAPPINGS["id"]: entry[KEY_MAPPINGS["id"]],
            KEY_MAPPINGS["title"]: entry[KEY_MAPPINGS["title"]],
            "l": letter,  # letter
            "p": page_number  # page number
        })
        
        letter_counts[letter] += 1
    
    return {
        "index": final_index,
        "by_letter": entries_by_letter
    }

def write_json_file(data: Any, output_path: Path) -> None:
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))


def create_paginated_files(entries: List[Dict], letter: str, data_dir: Path) -> None:
    # Sort entries by title
    sorted_entries = sorted(entries, key=lambda x: x[KEY_MAPPINGS["title"]])
    
    # Create letter directory
    letter_dir = data_dir / letter
    letter_dir.mkdir(exist_ok=True)
    
    # Calculate number of pages
    total_entries = len(sorted_entries)
    total_pages = math.ceil(total_entries / ITEMS_PER_PAGE)
    
    # Write info file
    info_path = letter_dir / "info.json"
    write_json_file({KEY_MAPPINGS["pages"]: total_pages}, info_path)
    
    # Write page files
    for page in range(total_pages):
        start_idx = page * ITEMS_PER_PAGE
        end_idx = start_idx + ITEMS_PER_PAGE
        page_entries = sorted_entries[start_idx:end_idx]
        
        page_path = letter_dir / f"{page + 1}.json"
        write_json_file(page_entries, page_path)
    
    return total_pages

def generate_sitemap(index_data: List[Dict], project_root: Path) -> None:
    # Create the root element
    urlset = ET.Element('urlset', {
        'xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9'
    })
    
    # Base URL of the website
    base_url = 'https://www.esp32rainbow.com'
    current_date = datetime.utcnow().strftime('%Y-%m-%d')
    
    # Add main games page
    games_url = ET.SubElement(urlset, 'url')
    ET.SubElement(games_url, 'loc').text = f'{base_url}/games'
    ET.SubElement(games_url, 'lastmod').text = current_date
    ET.SubElement(games_url, 'changefreq').text = 'weekly'
    ET.SubElement(games_url, 'priority').text = '0.8'
    
    # Add individual game pages
    for entry in index_data:
        game_url = ET.SubElement(urlset, 'url')
        ET.SubElement(game_url, 'loc').text = f'{base_url}/games/{entry["i"]}'
        ET.SubElement(game_url, 'lastmod').text = current_date
        ET.SubElement(game_url, 'changefreq').text = 'monthly'
        ET.SubElement(game_url, 'priority').text = '0.6'
    
    # Create the XML tree and write it to a file
    tree = ET.ElementTree(urlset)
    ET.indent(tree, space='  ')
    
    sitemap_path = project_root / 'public' / 'sitemap.xml'
    tree.write(sitemap_path, encoding='utf-8', xml_declaration=True)
    print(f'Generated sitemap at {sitemap_path}')

def cleanup_generated_files(project_root: Path) -> None:
    """Remove all generated files and directories before creating new ones."""
    # Clean up data directory
    data_dir = project_root / "public" / "data"
    if data_dir.exists():
        shutil.rmtree(data_dir)
        print(f"Cleaned up {data_dir}")
    
    # Clean up sitemap
    sitemap_path = project_root / "public" / "sitemap.xml"
    if sitemap_path.exists():
        sitemap_path.unlink()
        print(f"Cleaned up {sitemap_path}")

def main():
    # Get the project root directory (one level up from scripts)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    db_path = script_dir / "zxdb.sqlite"
    data_dir = project_root / "public" / "data"
    
    try:
        # Clean up existing files
        cleanup_generated_files(project_root)
        
        # Create the output directory
        data_dir.mkdir(parents=True, exist_ok=True)
        
        # Fetch and transform the data
        rows = fetch_data(str(db_path))

        scores = fetch_scores(str(db_path))

        transformed_data = transform_data(rows, scores)

        # Write the index file
        index_path = data_dir / "index.json"
        write_json_file(transformed_data["index"], index_path)
        print(f"Successfully generated index at {index_path}")
        
        # Write paginated files for each letter
        for letter, entries in transformed_data["by_letter"].items():
            total_pages = create_paginated_files(entries, letter, data_dir)
            print(f"Successfully generated {letter}/ with {total_pages} pages ({len(entries)} entries)")
                
        # Generate sitemap
        generate_sitemap(transformed_data["index"], project_root)
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main() 