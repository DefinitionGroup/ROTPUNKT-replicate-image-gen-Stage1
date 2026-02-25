# LoRA Training Dataset for Kitchen Surface Images

## Overview
This dataset contains 359 images of kitchen door surfaces and materials with accompanying text captions for LoRA (Low-Rank Adaptation) training of image generation models.

## Dataset Structure

### Images and Captions
- **Total Images**: 359
- **Format**: JPEG
- **Caption Format**: Individual .txt files with same filename as each image

### Material Types Distribution
- **Rahmenfront** (Frame Front): 103 images
- **Matte Kunststofffront** (Matte Plastic Front): 94 images
- **Echtlackfront** (Genuine Lacquer Front): 61 images
- **Eichenholzfront** (Oak Wood Front): 54 images
- **Synchronpore Front**: 36 images
- **Glaslaminat** (Glass Laminate): 7 images
- **Front mit Metalloberfläche** (Metal Surface): 3 images
- **Nussbaumfront** (Walnut Front): 1 image

### Subcategories
The dataset includes various finishes and styles:
- HPL (High Pressure Laminate): 45
- SY (Synchronized Texture): 36
- OL, FL, NL (Frame variants): 26 each
- A, B (Oak variants): 26 each
- FM (Fenix Matte): 24
- SC (Supermatt Lacquer): 22
- LX (Luxury Lacquer): 22
- CL (Classic Frame): 21
- HL (High Gloss Lacquer): 17
- And more...

## Caption Format

Each caption follows this structure:
```
[material type] [subcategory] [color code], [color description] [texture description] kitchen door surface
```

### Examples

**Lacquer Finishes:**
- `genuine lacquer front SC 843, dark blue ultra matte smooth kitchen door surface`
- `genuine lacquer front HL 165, medium gray high gloss smooth kitchen door surface`

**Wood Surfaces:**
- `oak wood front A 763, brown natural wood grain kitchen door surface`
- `walnut wood front WN 763, brown rich wood grain kitchen door surface`

**Special Surfaces:**
- `glass laminate front VI 242, light gray sleek glass finish kitchen door surface`
- `metal surface front ME 266, light brown brushed metal texture kitchen door surface`

**Matte Plastic:**
- `matte plastic front FM 145, white matte smooth kitchen door surface`
- `matte plastic front HPL 204, medium gray matte smooth kitchen door surface`

## Files Included

1. **Individual Caption Files**: 359 `.txt` files
   - Located next to each image file
   - Same filename as the corresponding image
   - Example: `843SC_converted.jpeg` → `843SC_converted.txt`

2. **lora_training_metadata.csv**
   - CSV format with all images and captions
   - Columns: image_path, absolute_path, material_type, subcategory, color_code, caption, txt_file

3. **lora_training_metadata.json**
   - JSON format with complete metadata
   - Structured data for programmatic access

4. **lora_training_summary.json**
   - Statistical summary
   - Breakdown by material type and subcategory

## Usage for LoRA Training

### Option 1: Individual Text Files
Most LoRA training tools (Stable Diffusion, Kohya, etc.) expect:
- One image file
- One matching .txt file with the same name
- Both in the same directory

This format is already set up correctly in this dataset.

### Option 2: Metadata File
Some training pipelines accept CSV or JSON metadata files:
- Use `lora_training_metadata.csv` for tabular data tools
- Use `lora_training_metadata.json` for custom training scripts

## Color Analysis
Colors were automatically analyzed using PIL (Python Imaging Library):
- Dominant color extraction
- HSV color space analysis
- Descriptive color names: white, light gray, medium gray, dark gray, black, blue, green, brown, etc.

## Quality Notes
- All captions are concise (1 sentence)
- Focus on: material, finish, color, texture
- Standardized format for consistency
- Suitable for training kitchen design/visualization models

## Technical Details
- Generated using Python with PIL for color analysis
- Organized by German material naming convention
- Translated to English descriptions in captions
- Code: 266ME → Color: light brown → Surface: metal

---

**Generated**: February 2026  
**Purpose**: LoRA Training for Kitchen Surface Generation AI Models
