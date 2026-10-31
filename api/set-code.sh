#!/bin/bash
# Enregistre un code (proches ou administrateur) comme secret Cloudflare, depuis le presse-papiers.
# Usage : bash api/set-code.sh ACCESS_CODE   (code des proches)
#         bash api/set-code.sh ADMIN_CODE    (code administrateur)
# Le code n'est jamais affiché ni écrit dans un fichier.
NAME="$1"
if [ "$NAME" != "ACCESS_CODE" ] && [ "$NAME" != "ADMIN_CODE" ]; then
  echo "Usage : bash api/set-code.sh ACCESS_CODE | ADMIN_CODE"; exit 1
fi
CODE="$(pbpaste | tr -d '\r\n')"
if [ ${#CODE} -lt 6 ]; then
  echo "Le presse-papiers ne contient pas de code d'au moins 6 caractères. Copiez votre code (Cmd + C) puis relancez."; exit 1
fi

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR" || exit 1
# Node fourni avec Hermes, au cas où le Terminal ne le trouve pas.
for NODE_DIR in "$HOME"/.hermes/tools/node-*/bin; do [ -d "$NODE_DIR" ] && PATH="$NODE_DIR:$PATH"; done
export PATH

OUTPUT="$(printf '%s' "$CODE" | "$DIR/node_modules/.bin/wrangler" secret put "$NAME" 2>&1)"
if echo "$OUTPUT" | grep -q "Success"; then
  echo "$NAME enregistré (${#CODE} caractères)."
  printf '' | pbcopy
else
  echo "Échec de l'enregistrement de $NAME. Détail :"
  echo "$OUTPUT" | grep -vF "$CODE" | tail -15
  exit 1
fi
