#!/bin/bash
# Enregistre un code (proches ou administrateur) comme secret Cloudflare, depuis le presse-papiers.
# Usage : bash api/set-code.sh ACCESS_CODE   (code des proches)
#         bash api/set-code.sh ADMIN_CODE    (code administrateur)
# Le code n'est jamais affiché ni écrit dans un fichier.
set -e
NAME="$1"
if [ "$NAME" != "ACCESS_CODE" ] && [ "$NAME" != "ADMIN_CODE" ]; then
  echo "Usage : bash api/set-code.sh ACCESS_CODE | ADMIN_CODE"; exit 1
fi
CODE="$(pbpaste | tr -d '\r\n')"
if [ ${#CODE} -lt 6 ]; then
  echo "Le presse-papiers ne contient pas de code d'au moins 6 caractères."; exit 1
fi
cd "$(dirname "$0")"
printf '%s' "$CODE" | npx wrangler secret put "$NAME" >/dev/null 2>&1 && echo "$NAME enregistré (${#CODE} caractères)." || { echo "Échec de l'enregistrement de $NAME."; exit 1; }
printf '' | pbcopy
