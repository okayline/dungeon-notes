#!/bin/sh
# Rebuild daily-dungeon-characters.xlsx from the game repo's current rules.js. Usage: roster/make.sh [path-to-daily-dungeon]
set -e
HERE=$(cd "$(dirname "$0")" && pwd); GAME=${1:-/home/claude/daily-dungeon}
T=$(mktemp -d); cp "$GAME"/rules.js "$GAME"/floor.js "$GAME"/screen.js "$T"/
sed -i 's/  const api = { summary,/  const __dump = {FAMILY,PROGRAMS,VOICE,PARTY_TALK,FAMILY_TALK,PARTY_HEAT,FAMILY_HEAT,PARTY_TIRED,FAMILY_TIRED,SNAP,QUIT,GRIEF,SNATCH,ASK,LEAVE_NO,SILENT_PARTY,CONFIDE,BANTER_ASK,DRINK_REACT,DEMON_ASK,PERSONA_OF,PARTY_PERSONA,SILENCE,LOOPED,STANCE_LINE,ALIGN_OUTLIERS,PROGRAM_JOB,CHATTER,HURT,LAST_WORDS,LAST_ANY,LAST_BEAST,alignOf,familyOf};\n  const api = { __dump, summary,/' "$T"/rules.js
DUMP_DIR=$T OUT_DIR=$T node "$HERE"/build.js >/dev/null
OUT_DIR=$T XLSX="$HERE"/../daily-dungeon-characters.xlsx python3 "$HERE"/mk.py
rm -rf "$T"
