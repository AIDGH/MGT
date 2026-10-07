#!/bin/bash
set -euo pipefail
umask 077
backup_dir=/var/backups/mgt
mkdir -p "$backup_dir"
stamp=$(date -u +%Y%m%dT%H%M%SZ)
work=$(mktemp -d "$backup_dir/.partial-XXXXXX")
trap 'rm -rf -- "$work"' EXIT
runuser -u postgres -- pg_dump -Fc mgt > "$work/database.dump"
tar -C /var/lib/mgt -czf "$work/uploads.tar.gz" uploads
mv "$work" "$backup_dir/$stamp"
find "$backup_dir" -mindepth 1 -maxdepth 1 -type d -name '20??????T??????Z' -mtime +14 -exec rm -rf -- {} +
