import re
import json

def parse_wikipedia_colors(text_content):
    colors = []
    seen_entries = set()

    pattern = re.compile(
        r"^([\w\s\(\)\-\.,'/&\[\]\^]+?)\s+(#(?:[0-9a-fA-F]{3}){1,2})\b.*$", 
        re.MULTILINE
    )

    lines_input = text_content.splitlines()
    
    for line in lines_input:
        line = line.strip()
        if not line:
            continue

        match = pattern.match(line)
        if match:
            name = match.group(1).strip()
            hex_code = match.group(2).strip().upper()

            name = re.sub(r'\s*\((?:Crayola|X11/web color|web|HTML/CSS color|Pantone|RYB|Munsell|NCS|pigment|UA|SAE/ECE|metallic|traditional|web color|color wheel|Color Wheel|Caran d\'Ache|Ace Hardware Color|Independent Retailers Colors|X11 gray)\)$', '', name, flags=re.IGNORECASE)
            name = re.sub(r'\s*\(\#\d+\)$', '', name)
            name = re.sub(r'\s*\[\d+\]$', '', name) 
            name = re.sub(r'\^\[\d+\]broken anchor\]$', '', name)
            name = name.strip()

            if len(hex_code) == 4:
                hex_code = f"#{hex_code[1]*2}{hex_code[2]*2}{hex_code[3]*2}"
            
            if name and re.match(r"^#[0-9A-F]{6}$", hex_code):
                entry_tuple = (name, hex_code)
                if entry_tuple not in seen_entries:
                    colors.append({"name": name, "hex": hex_code})
                    seen_entries.add(entry_tuple)

    for i in range(len(lines_input) -1):
        current_line = lines_input[i].strip()
        next_line = lines_input[i+1].strip()

        if not current_line.startswith("#") and re.search("[a-zA-Z]", current_line) and next_line.startswith("#"):
            name = current_line
            hex_code = next_line
            
            hex_match = re.match(r"^(#(?:[0-9a-fA-F]{3}){1,2})\b", hex_code)
            if not hex_match:
                continue

            hex_code = hex_match.group(1).strip().upper()

            name_match_bracket = re.match(r"^(?:\[\d+\])?([\w\s\(\)\-\.,'/&]+?)(?:\^\[\d+\]broken anchor\])?$", name)
            if name_match_bracket:
                name = name_match_bracket.group(1).strip()

            name = re.sub(r'\s*\((?:Crayola|X11/web color|web|HTML/CSS color|Pantone|RYB|Munsell|NCS|pigment|UA|SAE/ECE|metallic|traditional|web color|color wheel|Color Wheel|Caran d\'Ache|Ace Hardware Color|Independent Retailers Colors|X11 gray)\)$', '', name, flags=re.IGNORECASE)
            name = re.sub(r'\s*\(\#\d+\)$', '', name)
            name = re.sub(r'\s*\[\d+\]$', '', name)
            name = re.sub(r'\^\[\d+\]broken anchor\]$', '', name)
            name = name.strip()
            
            if len(name) == 1 and name.isupper():
                continue

            if len(hex_code) == 4:
                hex_code = f"#{hex_code[1]*2}{hex_code[2]*2}{hex_code[3]*2}"

            if name and re.match(r"^#[0-9A-F]{6}$", hex_code):
                entry_tuple = (name, hex_code)
                if entry_tuple not in seen_entries:
                    colors.append({"name": name, "hex": hex_code})
                    seen_entries.add(entry_tuple)
    
    return list(colors)

if __name__ == "__main__":
    try:
        with open("wikipedia_colors.txt", "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        print("Error: wikipedia_colors.txt not found. Please create it with the Wikipedia content.")
        exit(1)
    except Exception as e:
        print(f"Error reading wikipedia_colors.txt: {e}")
        exit(1)
        
    parsed_colors = parse_wikipedia_colors(content)
    
    try:
        with open("colors.json", "w", encoding="utf-8") as f:
            json.dump(parsed_colors, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Error writing colors.json: {e}")
        exit(1)
        
    print(f"Successfully parsed {len(parsed_colors)} colors and saved to colors.json")

    if parsed_colors:
        print("\nSample of parsed colors:")
        for i in range(min(5, len(parsed_colors))):
            print(parsed_colors[i])
        
        if len(parsed_colors) > 10:
            print("...")
        elif len(parsed_colors) > 5 : 
            if len(parsed_colors) < 10 :
                 print("...")
        
        if len(parsed_colors) > 5:
            start_index_for_last_five = max(5, len(parsed_colors) - 5)
            for i in range(start_index_for_last_five, len(parsed_colors)):
                print(parsed_colors[i])
