#!/bin/bash
# Usage (server root): bash /opt/mgt/releases/<release>/ops/deploy.sh <release>
set -euo pipefail
release_id=${1:?release id required}
[[ "$release_id" =~ ^[a-zA-Z0-9._-]+$ ]] || exit 2
release=/opt/mgt/releases/$release_id
cd "$release"
test -f package-lock.json
test -f /etc/mgt/api.env
chown -R mgt:mgt "$release"
runuser -u mgt -- env PATH=/usr/local/bin:/usr/bin:/bin npm ci --no-audit --no-fund
runuser -u mgt -- env PATH=/usr/local/bin:/usr/bin:/bin npm run build:all
set -a
source /etc/mgt/api.env
set +a
npm run db:migrate
npm run seed -w api
mkdir -p .next/standalone/.next
cp -a public .next/standalone/
cp -a .next/static .next/standalone/.next/
# Keep assets used by visitors who still have the previous page open.
if test -d /opt/mgt/current/.next/standalone/.next/static; then
    cp -an /opt/mgt/current/.next/standalone/.next/static/. .next/standalone/.next/static/
elif test -d /var/www/majdglobaltrading/current/_next/static; then
    cp -an /var/www/majdglobaltrading/current/_next/static/. .next/standalone/.next/static/
fi
chown -R mgt:mgt "$release"
install -m 644 ops/systemd/mgt-api.service /etc/systemd/system/
install -m 644 ops/systemd/mgt-web.service /etc/systemd/system/
install -m 644 ops/systemd/mgt-backup.service /etc/systemd/system/
install -m 644 ops/systemd/mgt-backup.timer /etc/systemd/system/
install -m 700 ops/backup.sh /usr/local/sbin/mgt-backup
systemctl daemon-reload
previous=$(readlink /opt/mgt/current || true)
ln -s "$release" /opt/mgt/current-next
mv -Tf /opt/mgt/current-next /opt/mgt/current
systemctl enable mgt-api mgt-web mgt-backup.timer
systemctl restart mgt-api mgt-web
healthy=false
for attempt in {1..30}; do
    if curl -fsS --max-time 2 http://127.0.0.1:4001/api/health >/dev/null && curl -fsS --max-time 2 http://127.0.0.1:3001/admin >/dev/null; then healthy=true; break; fi
    sleep 1
done
if [ "$healthy" != true ]; then
    if [ -n "$previous" ]; then ln -s "$previous" /opt/mgt/current-next; mv -Tf /opt/mgt/current-next /opt/mgt/current; systemctl restart mgt-api mgt-web; fi
    echo 'New services did not become healthy; Nginx was not changed.' >&2
    exit 1
fi
nginx_config=/etc/nginx/sites-available/majdglobaltrading.conf
cp -a "$nginx_config" "/etc/mgt/nginx-before-$release_id.conf"
install -m 644 ops/nginx/majdglobaltrading.conf "$nginx_config"
if ! nginx -t; then cp -a "/etc/mgt/nginx-before-$release_id.conf" "$nginx_config"; exit 1; fi
systemctl reload nginx
systemctl start mgt-backup.timer
systemctl start mgt-backup.service
printf 'Release active: %s\n' "$release_id"
